import assert from 'node:assert/strict';
import test from 'node:test';
import { optimizeRoute, type RouteItem, type RouteStoreConfig } from '../routecart-optimizer';

function makeItem(
  id: string,
  department: string,
  temperature: RouteItem['temperature'] = 'ambient',
): RouteItem & { id: string; name: string } {
  return {
    id,
    name: department,
    department,
    temperature,
    x: 0,
    y: 0,
  };
}

function routeDistance(
  route: RouteItem[],
  store: RouteStoreConfig,
): number {
  const points = [
    store.entrance,
    ...route.map((item) => store.markerPositions[item.department]),
    store.checkout,
  ];

  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

test('optimizer includes every requested department exactly once as a department block', () => {
  const store: RouteStoreConfig = {
    entrance: { x: 0, y: 0 },
    checkout: { x: 100, y: 100 },
    mapWidth: 100,
    mapHeight: 100,
    markerPositions: {
      A: { x: 20, y: 20 },
      B: { x: 80, y: 20 },
      C: { x: 20, y: 80 },
      D: { x: 80, y: 80 },
    },
  };

  const items = [
    makeItem('1', 'C'),
    makeItem('2', 'A'),
    makeItem('3', 'C'),
    makeItem('4', 'D'),
    makeItem('5', 'B'),
  ];

  const optimized = optimizeRoute(items, store);
  const departmentSequence = optimized.map((item) => item.department);
  const uniqueDepartments = departmentSequence.filter(
    (department, index) => index === 0 || department !== departmentSequence[index - 1],
  );

  assert.deepEqual(new Set(uniqueDepartments), new Set(['A', 'B', 'C', 'D']));
  assert.equal(uniqueDepartments.length, 4);
});

test('items from the same department remain together and preserve their relative order', () => {
  const store: RouteStoreConfig = {
    entrance: { x: 0, y: 0 },
    checkout: { x: 100, y: 100 },
    mapWidth: 100,
    mapHeight: 100,
    markerPositions: {
      A: { x: 20, y: 20 },
      B: { x: 80, y: 80 },
    },
  };

  const items = [
    makeItem('a1', 'A'),
    makeItem('b1', 'B'),
    makeItem('a2', 'A'),
  ];

  const optimized = optimizeRoute(items, store);
  const aItems = optimized.filter((item) => item.department === 'A');

  assert.deepEqual(aItems.map((item) => item.id), ['a1', 'a2']);
  assert.equal(
    Math.abs(
      optimized.findIndex((item) => item.id === 'a1') -
      optimized.findIndex((item) => item.id === 'a2'),
    ),
    1,
  );
});

test('optimizer removes a deliberately inefficient crossing/backtracking order', () => {
  const store: RouteStoreConfig = {
    entrance: { x: 0, y: 0 },
    checkout: { x: 100, y: 100 },
    mapWidth: 100,
    mapHeight: 100,
    markerPositions: {
      A: { x: 10, y: 10 },
      B: { x: 90, y: 10 },
      C: { x: 10, y: 90 },
      D: { x: 90, y: 90 },
    },
  };

  const deliberatelyBad = [
    makeItem('b', 'B'),
    makeItem('c', 'C'),
    makeItem('a', 'A'),
    makeItem('d', 'D'),
  ];

  const optimized = optimizeRoute(deliberatelyBad, store);

  assert.ok(
    routeDistance(optimized, store) < routeDistance(deliberatelyBad, store),
    'expected the optimized route to be shorter than the deliberately bad input order',
  );
});

test('frozen items are preferred later when that also fits the route geometry', () => {
  const store: RouteStoreConfig = {
    entrance: { x: 0, y: 0 },
    checkout: { x: 100, y: 0 },
    mapWidth: 100,
    mapHeight: 100,
    markerPositions: {
      A: { x: 20, y: 0 },
      B: { x: 60, y: 0 },
      F: { x: 80, y: 0 },
    },
  };

  const optimized = optimizeRoute(
    [
      makeItem('f', 'F', 'frozen'),
      makeItem('a', 'A'),
      makeItem('b', 'B'),
    ],
    store,
  );

  assert.equal(optimized[optimized.length - 1].department, 'F');
});

test('cold-item preference remains soft instead of forcing a huge detour', () => {
  const store: RouteStoreConfig = {
    entrance: { x: 0, y: 0 },
    checkout: { x: 100, y: 0 },
    mapWidth: 100,
    mapHeight: 100,
    markerPositions: {
      F: { x: 20, y: 0 },
      A: { x: 80, y: 0 },
    },
  };

  const optimized = optimizeRoute(
    [
      makeItem('f', 'F', 'frozen'),
      makeItem('a', 'A'),
    ],
    store,
  );

  assert.equal(optimized[0].department, 'F');
});
