export type RouteTemperature = 'ambient' | 'refrigerated' | 'frozen';

export type RouteItem = {
  department: string;
  temperature: RouteTemperature;
  x: number;
  y: number;
};

export type RouteStoreConfig = {
  entrance: { x: number; y: number };
  checkout: { x: number; y: number };
  mapWidth: number;
  mapHeight: number;
  markerPositions: Record<string, { x: number; y: number }>;
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getStorePosition(item: RouteItem, store: RouteStoreConfig) {
  return store.markerPositions[item.department] ?? {
    x: (item.x / 100) * store.mapWidth,
    y: (item.y / 100) * store.mapHeight,
  };
}

type DepartmentRouteNode = {
  department: string;
  x: number;
  y: number;
  temperature: RouteTemperature;
};

const TEMPERATURE_PRIORITY: Record<RouteTemperature, number> = {
  ambient: 0,
  refrigerated: 1,
  frozen: 2,
};

function buildDepartmentRouteNodes(items: RouteItem[], store: RouteStoreConfig): DepartmentRouteNode[] {
  const byDepartment = new Map<string, DepartmentRouteNode>();

  items.forEach((item) => {
    const position = getStorePosition(item, store);
    const existing = byDepartment.get(item.department);

    if (!existing) {
      byDepartment.set(item.department, {
        department: item.department,
        x: position.x,
        y: position.y,
        temperature: item.temperature,
      });
      return;
    }

    // If one department contains multiple items, preserve the coldest requirement.
    if (TEMPERATURE_PRIORITY[item.temperature] > TEMPERATURE_PRIORITY[existing.temperature]) {
      existing.temperature = item.temperature;
    }
  });

  return Array.from(byDepartment.values());
}

function departmentPathDistance(nodes: DepartmentRouteNode[], store: RouteStoreConfig): number {
  if (!nodes.length) return 0;

  const points = [store.entrance, ...nodes, store.checkout];
  return points.slice(1).reduce(
    (total, point, index) => total + distance(points[index], point),
    0,
  );
}

function routeTemperaturePenalty(nodes: DepartmentRouteNode[], store: RouteStoreConfig): number {
  if (nodes.length <= 1) return 0;

  const mapScale = Math.max(store.mapWidth, store.mapHeight);
  let penalty = 0;

  nodes.forEach((node, index) => {
    const progress = index / (nodes.length - 1);
    const remainingFraction = 1 - progress;

    // This is intentionally a soft preference rather than a hard rule.
    // A cold department can be visited earlier when doing so saves substantial walking.
    if (node.temperature === 'frozen') {
      penalty += mapScale * 0.18 * remainingFraction * remainingFraction;
    } else if (node.temperature === 'refrigerated') {
      penalty += mapScale * 0.07 * remainingFraction * remainingFraction;
    }
  });

  return penalty;
}

function departmentRouteScore(nodes: DepartmentRouteNode[], store: RouteStoreConfig): number {
  return departmentPathDistance(nodes, store) + routeTemperaturePenalty(nodes, store);
}

function buildGreedyDepartmentRoute(
  nodes: DepartmentRouteNode[],
  store: RouteStoreConfig,
  coldBias: number,
): DepartmentRouteNode[] {
  const remaining = [...nodes];
  const route: DepartmentRouteNode[] = [];
  let cursor = store.entrance;

  while (remaining.length) {
    const progress = nodes.length > 1 ? route.length / (nodes.length - 1) : 1;
    const remainingFraction = 1 - Math.min(1, progress);

    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    remaining.forEach((candidate, index) => {
      let candidateScore = distance(cursor, candidate);

      // Slightly favor choices that still leave a sensible path toward checkout.
      candidateScore += distance(candidate, store.checkout) * 0.04;

      // Different seeds use different cold-item biases. The final global score
      // decides which seed survives, so temperature never becomes a hard grouping.
      if (candidate.temperature === 'frozen') {
        candidateScore += Math.max(store.mapWidth, store.mapHeight)
          * coldBias
          * remainingFraction;
      } else if (candidate.temperature === 'refrigerated') {
        candidateScore += Math.max(store.mapWidth, store.mapHeight)
          * coldBias
          * 0.4
          * remainingFraction;
      }

      if (candidateScore < bestScore) {
        bestScore = candidateScore;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    route.push(next);
    cursor = next;
  }

  return route;
}

function improveRouteWithTwoOpt(
  initialRoute: DepartmentRouteNode[],
  store: RouteStoreConfig,
): DepartmentRouteNode[] {
  let best = [...initialRoute];
  let bestScore = departmentRouteScore(best, store);

  // 2-opt removes route crossings and large backtracking loops by reversing
  // segments whenever the complete entrance-to-checkout route gets cheaper.
  for (let pass = 0; pass < 12; pass += 1) {
    let improved = false;

    for (let start = 0; start < best.length - 1; start += 1) {
      for (let end = start + 1; end < best.length; end += 1) {
        const candidate = [
          ...best.slice(0, start),
          ...best.slice(start, end + 1).reverse(),
          ...best.slice(end + 1),
        ];

        const candidateScore = departmentRouteScore(candidate, store);

        if (candidateScore + 0.001 < bestScore) {
          best = candidate;
          bestScore = candidateScore;
          improved = true;
        }
      }
    }

    if (!improved) break;
  }

  return best;
}

function improveRouteWithRelocation(
  initialRoute: DepartmentRouteNode[],
  store: RouteStoreConfig,
): DepartmentRouteNode[] {
  let best = [...initialRoute];
  let bestScore = departmentRouteScore(best, store);

  // A relocation pass catches improvements that segment reversal alone can miss.
  for (let pass = 0; pass < 6; pass += 1) {
    let improved = false;

    for (let from = 0; from < best.length; from += 1) {
      for (let to = 0; to < best.length; to += 1) {
        if (from === to) continue;

        const candidate = [...best];
        const [moved] = candidate.splice(from, 1);
        candidate.splice(to, 0, moved);

        const candidateScore = departmentRouteScore(candidate, store);

        if (candidateScore + 0.001 < bestScore) {
          best = candidate;
          bestScore = candidateScore;
          improved = true;
        }
      }
    }

    if (!improved) break;
  }

  return best;
}

function optimizeDepartmentRoute(
  nodes: DepartmentRouteNode[],
  store: RouteStoreConfig,
): DepartmentRouteNode[] {
  if (nodes.length <= 2) {
    const direct = [...nodes];
    const reversed = [...nodes].reverse();
    return departmentRouteScore(reversed, store) < departmentRouteScore(direct, store)
      ? reversed
      : direct;
  }

  // Multiple deterministic starts reduce the chance that nearest-neighbor
  // traps the route in a poor local solution.
  const seeds = [
    buildGreedyDepartmentRoute(nodes, store, 0),
    buildGreedyDepartmentRoute(nodes, store, 0.08),
    buildGreedyDepartmentRoute(nodes, store, 0.18),
    [...nodes].sort((a, b) => a.x - b.x),
    [...nodes].sort((a, b) => b.x - a.x),
  ];

  let bestRoute: DepartmentRouteNode[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  seeds.forEach((seed) => {
    let candidate = improveRouteWithTwoOpt(seed, store);
    candidate = improveRouteWithRelocation(candidate, store);
    candidate = improveRouteWithTwoOpt(candidate, store);

    const candidateScore = departmentRouteScore(candidate, store);

    if (candidateScore < bestScore) {
      bestScore = candidateScore;
      bestRoute = candidate;
    }
  });

  return bestRoute ?? nodes;
}

export function optimizeRoute<T extends RouteItem>(items: T[], store: RouteStoreConfig): T[] {
  if (items.length <= 1) return [...items];

  const departmentNodes = buildDepartmentRouteNodes(items, store);
  const optimizedDepartments = optimizeDepartmentRoute(departmentNodes, store);
  const departmentRank = new Map(
    optimizedDepartments.map((node, index) => [node.department, index]),
  );

  // RouteItems in the same department stay together. Their original within-department
  // order is preserved while the department blocks follow the optimized route.
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const departmentDifference =
        (departmentRank.get(a.item.department) ?? Number.MAX_SAFE_INTEGER) -
        (departmentRank.get(b.item.department) ?? Number.MAX_SAFE_INTEGER);

      return departmentDifference || a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}
