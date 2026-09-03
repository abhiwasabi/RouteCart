import React, { useMemo, useState } from 'react';
import {
  Image,
  InputAccessoryView,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import {
  classifyDepartment,
  CORAL_RIDGE_DEPARTMENTS,
  OVIEDO_DEEP_LAKE_DEPARTMENTS,
  ORLANDO_E_COLONIAL_DEPARTMENTS,
  parseItemLine,
} from './routecart-classifier';
import { optimizeRoute } from './routecart-optimizer';

type Temperature = 'ambient' | 'refrigerated' | 'frozen';
type Tab = 'list' | 'map' | 'order';
type IconName = keyof typeof Ionicons.glyphMap;
type StoreId = 'coral-ridge' | 'oviedo-deep-lake' | 'orlando-e-colonial';

type DepartmentDefinition = {
  temperature: Temperature;
  keywords: string[];
};

type StoreConfig = {
  id: StoreId;
  name: string;
  address: string;
  mapSource: any;
  mapWidth: number;
  mapHeight: number;
  entrance: { x: number; y: number };
  entrances?: { x: number; y: number }[];
  checkout: { x: number; y: number };
  feetPerMapPixel: number;
  markerPositions: Record<string, { x: number; y: number }>;
  departments: Record<string, DepartmentDefinition>;
};

type Item = {
  id: string;
  name: string;
  quantity?: number;
  department: string;
  temperature: Temperature;
  x: number;
  y: number;
};

type DepartmentStop = {
  id: string;
  department: string;
  number: number;
  x: number;
  y: number;
};


type RouteEstimate = {
  optimizedDistanceFeet: number;
  originalDistanceFeet: number;
  distanceSavedFeet: number;
  distanceSavedPercent: number;
  estimatedMinutes: number;
  timeSavedMinutes: number;
};

const LIGHT_COLORS = {
  background: '#F3F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  ink: '#142033',
  muted: '#667085',
  subtle: '#98A2B3',
  border: '#E3E8EF',
  borderStrong: '#D7DEE8',
  accent: '#1D5FD1',
  accentDark: '#174EA6',
  accentSoft: '#EAF2FF',
  accentBorder: '#C9DAF7',
  success: '#138A5B',
  successSoft: '#EFF9F4',
  successBorder: '#CFE7DC',
  danger: '#C2414B',
  progressTrack: '#E9EDF3',
  shadow: '#172033',
  mapSurface: '#FFFFFF',
  onAccent: '#FFFFFF',
};

type ThemeColors = typeof LIGHT_COLORS;

const DARK_COLORS: ThemeColors = {
  background: '#0D1117',
  surface: '#151B23',
  surfaceMuted: '#1B222C',
  ink: '#F4F7FB',
  muted: '#A7B1C0',
  subtle: '#738094',
  border: '#273140',
  borderStrong: '#354153',
  accent: '#6EA8FF',
  accentDark: '#90BDFF',
  accentSoft: '#172B49',
  accentBorder: '#2D568C',
  success: '#56D39B',
  successSoft: '#123128',
  successBorder: '#245744',
  danger: '#FF7A85',
  progressTrack: '#273140',
  shadow: '#000000',
  mapSurface: '#FFFFFF',
  onAccent: '#FFFFFF',
};

const ITEM_INPUT_ACCESSORY_ID = 'routecart-item-input-accessory';

const AISLE_PATH_FACTOR = 1.25;
const WALKING_SPEED_FEET_PER_SECOND = 3;
const PICKUP_SECONDS_PER_ITEM = 25;

const CORAL_RIDGE_MARKERS: Record<string, { x: number; y: number }> = {
  Alcohol: { x: 272, y: 92 },
  Dairy: { x: 119, y: 137 },
  'Snacks & Beverages': { x: 204, y: 230 },
  Deli: { x: 196, y: 746 },
  'Meat & Seafood': { x: 55, y: 500 },
  Grocery: { x: 202, y: 399 },
  Frozen: { x: 199, y: 575 },
  Bakery: { x: 51, y: 702 },
  'Fresh Produce': { x: 202, y: 683 },
  Pets: { x: 389, y: 219 },
  Cleaning: { x: 476, y: 219 },
  'Household Paper': { x: 550, y: 220 },
  'Office Supplies': { x: 612, y: 219 },
  Electronics: { x: 716, y: 220 },
  Toys: { x: 930, y: 220 },
  Sports: { x: 1098, y: 220 },
  Baby: { x: 458, y: 384 },
  Girls: { x: 600, y: 384 },
  Boys: { x: 670, y: 384 },
  'Arts & Crafts': { x: 759, y: 398 },
  Jewelry: { x: 393, y: 490 },
  Shoes: { x: 554, y: 488 },
  Womens: { x: 451, y: 678 },
  Intimates: { x: 438, y: 591 },
  Mens: { x: 638, y: 612 },
  'Party Supplies': { x: 761, y: 516 },
  Seasonal: { x: 759, y: 638 },
  Home: { x: 925, y: 357 },
  Furniture: { x: 926, y: 412 },
  Bedding: { x: 925, y: 458 },
  'Bath & Shower': { x: 925, y: 504 },
  Laundry: { x: 925, y: 549 },
  Kitchen: { x: 925, y: 640 },
  Auto: { x: 1099, y: 373 },
  Hardware: { x: 1099, y: 460 },
  Paint: { x: 1099, y: 535 },
  Garden: { x: 1099, y: 671 },
  Health: { x: 932, y: 784 },
  'Personal Care': { x: 1068, y: 784 },
  Beauty: { x: 1182, y: 784 },
};

// Exact department labels and approximate label-center coordinates from the
// 1515 × 1038 Oviedo Deep Lake Rd store map.
const OVIEDO_DEEP_LAKE_MARKERS: Record<string, { x: number; y: number }> = {
  Pets: { x: 290, y: 99 },
  Cleaning: { x: 289, y: 174 },
  'Household Paper': { x: 288, y: 232 },
  Baby: { x: 554, y: 153 },
  Electronics: { x: 762, y: 153 },
  'Office Supplies': { x: 903, y: 151 },
  'Arts & Crafts': { x: 1007, y: 155 },
  Toys: { x: 1167, y: 158 },
  Sports: { x: 1365, y: 159 },
  Alcohol: { x: 286, y: 320 },
  'Snacks & Bev': { x: 287, y: 369 },
  Grocery: { x: 287, y: 494 },
  Dairy: { x: 118, y: 529 },
  Frozen: { x: 287, y: 644 },
  'Meat & Seafood': { x: 286, y: 738 },
  Bakery: { x: 384, y: 807 },
  Deli: { x: 216, y: 834 },
  'Fresh Produce': { x: 612, y: 749 },
  Seasonal: { x: 550, y: 348 },
  'Party Supplies': { x: 682, y: 345 },
  Furniture: { x: 603, y: 432 },
  Laundry: { x: 603, y: 469 },
  'Bath & Shower': { x: 603, y: 502 },
  Bedding: { x: 603, y: 541 },
  Home: { x: 603, y: 588 },
  Kitchen: { x: 603, y: 646 },
  Boys: { x: 877, y: 327 },
  Girls: { x: 1092, y: 327 },
  Mens: { x: 986, y: 408 },
  Intimates: { x: 885, y: 521 },
  Shoes: { x: 1111, y: 521 },
  Womens: { x: 940, y: 615 },
  Jewelry: { x: 1153, y: 617 },
  Auto: { x: 1360, y: 333 },
  Hardware: { x: 1360, y: 440 },
  Paint: { x: 1360, y: 519 },
  Garden: { x: 1360, y: 627 },
  Health: { x: 1193, y: 807 },
  'Personal Care': { x: 1314, y: 807 },
  Beauty: { x: 1402, y: 808 },
};


// Approximate label-center coordinates from the 1206 × 860
// Walmart Orlando E Colonial Drive store map.
const ORLANDO_E_COLONIAL_MARKERS: Record<string, { x: number; y: number }> = {
  Hardware: { x: 335, y: 285 },
  Paint: { x: 417, y: 284 },
  'Arts & Crafts': { x: 478, y: 283 },
  Books: { x: 518, y: 283 },
  Electronics: { x: 608, y: 283 },
  Pets: { x: 730, y: 283 },
  Cleaning: { x: 780, y: 286 },
  'Household Paper': { x: 830, y: 282 },
  'Snacks & Bev': { x: 936, y: 294 },
  Dairy: { x: 984, y: 234 },
  Grocery: { x: 936, y: 395 },
  'Meat & Seafood': { x: 1026, y: 458 },
  Frozen: { x: 938, y: 503 },
  'Fresh Produce': { x: 945, y: 566 },
  Bakery: { x: 1040, y: 566 },
  Deli: { x: 950, y: 606 },
  Alcohol: { x: 1128, y: 665 },

  Auto: { x: 324, y: 369 },
  Laundry: { x: 453, y: 395 },
  Furniture: { x: 488, y: 372 },
  'Office Supplies': { x: 571, y: 391 },
  Girls: { x: 645, y: 378 },
  Baby: { x: 769, y: 377 },
  Sports: { x: 295, y: 426 },
  'Bath & Shower': { x: 415, y: 419 },
  Boys: { x: 644, y: 441 },
  Mens: { x: 767, y: 440 },
  'Party Supplies': { x: 571, y: 468 },
  Bedding: { x: 415, y: 466 },
  Toys: { x: 296, y: 510 },
  Kitchen: { x: 486, y: 509 },
  Shoes: { x: 661, y: 505 },
  Intimates: { x: 791, y: 502 },
  Home: { x: 415, y: 539 },
  Seasonal: { x: 571, y: 547 },
  Jewelry: { x: 644, y: 556 },
  Womens: { x: 765, y: 555 },
  Clearance: { x: 296, y: 571 },

  Garden: { x: 145, y: 645 },
  Beauty: { x: 290, y: 625 },
  'Personal Care': { x: 352, y: 625 },
  Health: { x: 463, y: 617 },
};


type MarkerOffsetMap = Record<string, { dx: number; dy: number }>;

const DEFAULT_MARKER_ACCENT_OFFSET = { dx: 22, dy: -18 };

const CORAL_RIDGE_MARKER_OFFSETS: MarkerOffsetMap = {
  Dairy: { dx: 18, dy: -16 },
  Deli: { dx: 18, dy: -18 },
  'Meat & Seafood': { dx: 10, dy: -18 },
  Grocery: { dx: 22, dy: -12 },
  Frozen: { dx: 22, dy: -12 },
  Bakery: { dx: 18, dy: -18 },
  'Fresh Produce': { dx: 28, dy: -18 },
  'Office Supplies': { dx: 14, dy: -16 },
  'Household Paper': { dx: 14, dy: -16 },
  Electronics: { dx: 28, dy: -18 },
  'Arts & Crafts': { dx: 24, dy: -18 },
  Womens: { dx: 18, dy: -16 },
  'Party Supplies': { dx: 16, dy: -16 },
  'Personal Care': { dx: 18, dy: -14 },
};

const OVIEDO_DEEP_LAKE_MARKER_OFFSETS: MarkerOffsetMap = {
  Pets: { dx: 18, dy: -18 },
  Cleaning: { dx: 24, dy: -18 },
  'Household Paper': { dx: 26, dy: -18 },
  Electronics: { dx: 28, dy: -18 },
  'Snacks & Bev': { dx: 24, dy: -18 },
  'Snacks & Beverages': { dx: 24, dy: -18 },
  'Fresh Produce': { dx: 28, dy: -18 },
  Womens: { dx: 18, dy: -16 },
  'Personal Care': { dx: 18, dy: -14 },
  Dairy: { dx: 12, dy: -16 },
  Frozen: { dx: 18, dy: -14 },
};


const ORLANDO_E_COLONIAL_MARKER_OFFSETS: MarkerOffsetMap = {
  Hardware: { dx: 18, dy: -16 },
  Paint: { dx: 16, dy: -16 },
  'Arts & Crafts': { dx: 20, dy: -18 },
  Books: { dx: 16, dy: -18 },
  Electronics: { dx: 26, dy: -18 },
  Pets: { dx: 18, dy: -18 },
  Cleaning: { dx: 18, dy: -18 },
  'Household Paper': { dx: 18, dy: -18 },
  'Snacks & Bev': { dx: 24, dy: -16 },
  Dairy: { dx: 18, dy: -16 },
  Grocery: { dx: 24, dy: -14 },
  'Meat & Seafood': { dx: -18, dy: -18 },
  Frozen: { dx: 24, dy: -14 },
  'Fresh Produce': { dx: 28, dy: -16 },
  Bakery: { dx: 18, dy: -16 },
  Deli: { dx: 18, dy: -16 },
  Alcohol: { dx: 18, dy: -16 },
  'Office Supplies': { dx: 18, dy: -18 },
  'Bath & Shower': { dx: 18, dy: -16 },
  'Party Supplies': { dx: 18, dy: -16 },
  Womens: { dx: 18, dy: -16 },
  'Personal Care': { dx: 18, dy: -14 },
  Clearance: { dx: 20, dy: -14 },
};

function getMarkerAccentPosition(store: StoreConfig, department: string) {
  const base = store.markerPositions[department];
  if (!base) return null;

  const offsets =
    store.id === 'coral-ridge'
      ? CORAL_RIDGE_MARKER_OFFSETS
      : store.id === 'orlando-e-colonial'
        ? ORLANDO_E_COLONIAL_MARKER_OFFSETS
        : OVIEDO_DEEP_LAKE_MARKER_OFFSETS;

  const offset = offsets[department] ?? DEFAULT_MARKER_ACCENT_OFFSET;
  return {
    x: base.x + offset.dx,
    y: base.y + offset.dy,
  };
}

const STORES: Record<StoreId, StoreConfig> = {
  'coral-ridge': {
    id: 'coral-ridge',
    name: 'Walmart Coral Ridge SuperCenter',
    address: '6001 Coral Ridge Drive',
    mapSource: require('./assets/coral-ridge-walmart-map.png'),
    mapWidth: 1415,
    mapHeight: 1112,
    entrance: { x: 850, y: 984 },
    checkout: { x: 558, y: 792 },
    feetPerMapPixel: 0.47,
    markerPositions: CORAL_RIDGE_MARKERS,
    departments: CORAL_RIDGE_DEPARTMENTS,
  },
  'oviedo-deep-lake': {
    id: 'oviedo-deep-lake',
    name: 'Walmart Oviedo Deep Lake Rd Supercenter',
    address: '5511 Deep Lake Rd, Oviedo, FL 32765',
    mapSource: require('./assets/walmart_oviedo_map.png'),
    mapWidth: 1515,
    mapHeight: 1038,
    entrance: { x: 779, y: 972 },
    checkout: { x: 956, y: 765 },
    feetPerMapPixel: 0.381,
    markerPositions: OVIEDO_DEEP_LAKE_MARKERS,
    departments: OVIEDO_DEEP_LAKE_DEPARTMENTS,
  },
  'orlando-e-colonial': {
    id: 'orlando-e-colonial',
    name: 'Walmart Orlando E Colonial Drive Supercenter',
    address: '11250 E Colonial Dr, Orlando, FL 32817',
    mapSource: require('./assets/walmart_orlando_e_colonial_map.jpeg'),
    mapWidth: 1206,
    mapHeight: 860,

    // Both lower door areas on this map are entrances/exits.
    // RouteCart automatically chooses whichever entrance gives the shorter route.
    entrance: { x: 543, y: 750 },
    entrances: [
      { x: 543, y: 750 },
      { x: 892, y: 750 },
    ],

    checkout: { x: 719, y: 633 },

    // Approximate scale used only for displayed distance/time estimates.
    feetPerMapPixel: 0.42,
    markerPositions: ORLANDO_E_COLONIAL_MARKERS,
    departments: ORLANDO_E_COLONIAL_DEPARTMENTS,
  },
};

const STORE_IDS: StoreId[] = ['coral-ridge', 'oviedo-deep-lake', 'orlando-e-colonial'];

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getStorePosition(item: Item, store: StoreConfig) {
  return store.markerPositions[item.department] ?? {
    x: (item.x / 100) * store.mapWidth,
    y: (item.y / 100) * store.mapHeight,
  };
}


function classifyItem(
  name: string,
  store: StoreConfig,
): Pick<Item, 'department' | 'temperature' | 'x' | 'y'> {
  const classification = classifyDepartment(name, store.departments);
  const position = store.markerPositions[classification.department] ??
    store.markerPositions.Grocery ?? {
      x: store.mapWidth / 2,
      y: store.mapHeight / 2,
    };

  return {
    department: classification.department,
    temperature: classification.temperature,
    x: (position.x / store.mapWidth) * 100,
    y: (position.y / store.mapHeight) * 100,
  };
}

function createItem(name: string, store: StoreConfig, quantity?: number): Item {
  const location = classifyItem(name, store);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    quantity,
    ...location,
  };
}

function getDepartmentStops(route: Item[], store: StoreConfig): DepartmentStop[] {
  const seen = new Set<string>();
  const stops: DepartmentStop[] = [];

  route.forEach((item) => {
    if (seen.has(item.department)) return;
    seen.add(item.department);

    const position = getMarkerAccentPosition(store, item.department) ?? {
      x: (item.x / 100) * store.mapWidth,
      y: (item.y / 100) * store.mapHeight,
    };

    stops.push({
      id: item.department,
      department: item.department,
      number: stops.length + 1,
      x: position.x,
      y: position.y,
    });
  });

  return stops;
}

type RoutePlan = {
  route: Item[];
  store: StoreConfig;
};

function buildBestRoutePlan(items: Item[], store: StoreConfig): RoutePlan {
  const entranceCandidates =
    store.entrances && store.entrances.length
      ? store.entrances
      : [store.entrance];

  let bestPlan: RoutePlan | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  entranceCandidates.forEach((entrance) => {
    const candidateStore: StoreConfig = {
      ...store,
      entrance,
    };

    const candidateRoute = optimizeRoute(items, candidateStore);
    const candidateStops = getDepartmentStops(candidateRoute, candidateStore);

    if (!candidateStops.length) {
      if (!bestPlan) bestPlan = { route: candidateRoute, store: candidateStore };
      return;
    }

    const points = [candidateStore.entrance, ...candidateStops, candidateStore.checkout];
    const candidateDistance = points.slice(1).reduce(
      (total, point, index) => total + distance(points[index], point),
      0,
    );

    if (candidateDistance < bestDistance) {
      bestDistance = candidateDistance;
      bestPlan = {
        route: candidateRoute,
        store: candidateStore,
      };
    }
  });

  return bestPlan ?? {
    route: optimizeRoute(items, store),
    store,
  };
}

function calculateRouteDistanceFeet(stops: DepartmentStop[], store: StoreConfig): number {
  if (!stops.length) return 0;

  const points = [store.entrance, ...stops, store.checkout];
  const mapPixels = points.slice(1).reduce((total, point, index) => {
    return total + distance(points[index], point);
  }, 0);

  return mapPixels * store.feetPerMapPixel * AISLE_PATH_FACTOR;
}

function calculateRouteEstimate(
  optimizedStops: DepartmentStop[],
  originalStops: DepartmentStop[],
  itemCount: number,
  store: StoreConfig,
): RouteEstimate {
  const optimizedDistanceFeet = calculateRouteDistanceFeet(optimizedStops, store);
  const originalDistanceFeet = calculateRouteDistanceFeet(originalStops, store);
  const distanceSavedFeet = Math.max(0, originalDistanceFeet - optimizedDistanceFeet);
  const distanceSavedPercent = originalDistanceFeet > 0
    ? Math.round((distanceSavedFeet / originalDistanceFeet) * 100)
    : 0;

  const walkingSeconds = optimizedDistanceFeet / WALKING_SPEED_FEET_PER_SECOND;
  const pickupSeconds = itemCount * PICKUP_SECONDS_PER_ITEM;
  const estimatedMinutes = itemCount > 0
    ? Math.max(1, Math.round((walkingSeconds + pickupSeconds) / 60))
    : 0;
  const timeSavedMinutes = Math.max(
    0,
    Math.round((distanceSavedFeet / WALKING_SPEED_FEET_PER_SECOND) / 60),
  );

  return {
    optimizedDistanceFeet,
    originalDistanceFeet,
    distanceSavedFeet,
    distanceSavedPercent,
    estimatedMinutes,
    timeSavedMinutes,
  };
}

function formatDistance(feet: number): string {
  if (feet <= 0) return '0 ft';
  if (feet < 1000) return `${Math.round(feet / 10) * 10} ft`;
  return `${(feet / 5280).toFixed(2)} mi`;
}

function departmentTone(department: string, isDark: boolean) {
  if (isDark) {
    if (department === 'Garden' || department === 'Grocery' || department === 'Snacks & Beverages') {
      return { background: '#18362B', text: '#83D6AA' };
    }
    if (department === 'Dairy') return { background: '#18334D', text: '#86C7FF' };
    if (department === 'Frozen') return { background: '#2D2748', text: '#C4B3FF' };
    if (department === 'Electronics') return { background: '#262D50', text: '#AEB8FF' };
    if (department === 'Personal Care') return { background: '#48263A', text: '#F2A8CD' };
    if (department === 'Pets') return { background: '#49301E', text: '#F2B982' };
    return { background: '#273140', text: '#C1CAD7' };
  }

  if (department === 'Garden' || department === 'Grocery' || department === 'Snacks & Beverages') {
    return { background: '#EAF7EF', text: '#247A50' };
  }
  if (department === 'Dairy') return { background: '#E9F3FF', text: '#1769AA' };
  if (department === 'Frozen') return { background: '#F1ECFF', text: '#6848B8' };
  if (department === 'Electronics') return { background: '#EEF0FF', text: '#5057A8' };
  if (department === 'Personal Care') return { background: '#FBEAF3', text: '#A13D72' };
  if (department === 'Pets') return { background: '#FFF1E5', text: '#A75B1E' };
  return { background: '#EEF2F6', text: '#526173' };
}

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWide = windowWidth >= 900;
  const [selectedStoreId, setSelectedStoreId] = useState<StoreId>('coral-ridge');
  const currentStore = STORES[selectedStoreId];
  const availableMapHeight = Math.max(190, windowHeight - 350);
  const mapWidth = Math.min(
    windowWidth - 40,
    1060,
    availableMapHeight * (currentStore.mapWidth / currentStore.mapHeight),
  );

  const [isDark, setIsDark] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [tab, setTab] = useState<Tab>('list');
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const routePlan = useMemo(
    () => buildBestRoutePlan(items, currentStore),
    [items, selectedStoreId],
  );
  const route = routePlan.route;
  const activeRouteStore = routePlan.store;

  const departmentStops = useMemo(
    () => getDepartmentStops(route, activeRouteStore),
    [route, activeRouteStore],
  );
  const originalDepartmentStops = useMemo(
    () => getDepartmentStops(items, activeRouteStore),
    [items, activeRouteStore],
  );
  const routeEstimate = useMemo(
    () => calculateRouteEstimate(
      departmentStops,
      originalDepartmentStops,
      items.length,
      activeRouteStore,
    ),
    [departmentStops, originalDepartmentStops, items.length, activeRouteStore],
  );
  const completed = items.filter((item) => checked[item.id]).length;
  const completionPercent = items.length ? Math.round((completed / items.length) * 100) : 0;

  const addItems = () => {
    Keyboard.dismiss();

    const parsedItems = draft
      .split(/\n|;/)
      .map(parseItemLine)
      .filter((item): item is { name: string; quantity?: number } => Boolean(item));

    if (!parsedItems.length) return;

    setItems((current) => [
      ...current,
      ...parsedItems.map((item) => createItem(item.name, currentStore, item.quantity)),
    ]);
    setDraft('');
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setChecked((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const clearList = () => {
    Keyboard.dismiss();
    setItems([]);
    setChecked({});
    setDraft('');
  };

  const selectStore = (storeId: StoreId) => {
    const nextStore = STORES[storeId];
    Keyboard.dismiss();
    setSelectedStoreId(storeId);
    setItems((current) =>
      current.map((item) => ({
        ...item,
        ...classifyItem(item.name, nextStore),
      })),
    );
    setChecked({});
    setIsLocationMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.appHeader}>
        <View style={styles.headerInner}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="navigate" size={18} color={colors.onAccent} />
            </View>
            <View>
              <Text style={styles.brand}>RouteCart</Text>
              <Text style={styles.brandCaption}>In-store route intelligence</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {isWide ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose store location"
                activeOpacity={0.8}
                style={[styles.storeChip, styles.storeChipWide]}
                onPress={() => setIsLocationMenuOpen((current) => !current)}
              >
                <Ionicons name="location-outline" size={16} color={colors.accent} />
                <Text style={styles.storeChipText} numberOfLines={1}>
                  {currentStore.name}
                </Text>
                <Ionicons
                  name={isLocationMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={colors.muted}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose store location"
                activeOpacity={0.8}
                style={[
                  styles.headerIconButton,
                  isLocationMenuOpen && styles.headerIconButtonActive,
                ]}
                onPress={() => setIsLocationMenuOpen((current) => !current)}
              >
                <Ionicons name="location-outline" size={20} color={colors.accent} />
                <Ionicons
                  name={isLocationMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={10}
                  color={colors.muted}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              activeOpacity={0.8}
              style={[styles.themeToggle, !isWide && styles.themeToggleCompact]}
              onPress={() => {
                setIsLocationMenuOpen(false);
                setIsDark((current) => !current);
              }}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={isWide ? 17 : 20}
                color={colors.accent}
              />
              {isWide ? (
                <Text style={styles.themeToggleText}>{isDark ? 'Light' : 'Dark'}</Text>
              ) : null}
            </TouchableOpacity>
          </View>

          {isLocationMenuOpen ? (
            <View style={[styles.locationMenu, isWide && styles.locationMenuWide]}>
              <Text style={styles.locationMenuLabel}>STORE LOCATION</Text>
              <View style={styles.locationMenuOptions}>
                {STORE_IDS.map((storeId) => {
                  const store = STORES[storeId];
                  const selected = storeId === selectedStoreId;

                  return (
                    <TouchableOpacity
                      key={storeId}
                      activeOpacity={0.8}
                      style={[
                        styles.locationMenuOption,
                        selected && styles.locationMenuOptionSelected,
                      ]}
                      onPress={() => selectStore(storeId)}
                    >
                      <View style={styles.locationMenuIcon}>
                        <Ionicons name="storefront-outline" size={18} color={colors.accent} />
                      </View>

                      <View style={styles.locationMenuCopy}>
                        <Text style={styles.locationMenuTitle}>{store.name}</Text>
                        <Text style={styles.locationMenuAddress}>{store.address}</Text>
                      </View>

                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={21}
                        color={selected ? colors.accent : colors.borderStrong}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {tab === 'list' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={styles.screenContent}
        >
          <View style={styles.contentContainer}>
            <View style={[styles.pageIntro, isWide && styles.pageIntroWide]}>
              <View style={styles.pageIntroCopy}>
                <Text style={styles.eyebrow}>SMART IN-STORE NAVIGATION</Text>
                <Text style={styles.title}>Plan a faster trip through the store.</Text>
                <Text style={styles.subtitle}>
                  Add your shopping list and RouteCart will organize it into an efficient department-by-department path.
                </Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryValue}>{items.length}</Text>
                <Text style={styles.summaryLabel}>{items.length === 1 ? 'item ready' : 'items ready'}</Text>
              </View>
            </View>

            <View style={[styles.workspace, isWide && styles.workspaceWide]}>
              <View style={[styles.inputPanel, isWide && styles.inputPanelWide]}>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="add" size={18} color={colors.accent} />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={styles.sectionTitle}>Add items</Text>
                    <Text style={styles.sectionSubtitle}>One item per line. Quantities can be written as x2 or (2).</Text>
                  </View>
                </View>

                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={'Bananas\nPaper towels\nIce cream (2)'}
                  placeholderTextColor={colors.subtle}
                  multiline
                  inputAccessoryViewID={Platform.OS === 'ios' ? ITEM_INPUT_ACCESSORY_ID : undefined}
                  selectionColor={colors.accent}
                  style={styles.listInput}
                />

                <View style={styles.inputActions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.secondaryButton, !items.length && styles.disabledButton]}
                    onPress={clearList}
                    disabled={!items.length}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.muted} />
                    <Text style={styles.secondaryButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.addButton, !draft.trim() && styles.disabledButton]}
                    onPress={addItems}
                    disabled={!draft.trim()}
                  >
                    <Ionicons name="add" size={19} color={colors.onAccent} />
                    <Text style={styles.addButtonText}>Add to list</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.listPanel, isWide && styles.listPanelWide]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Shopping list</Text>
                    <Text style={styles.cardSubtitle}>Review items before building the route.</Text>
                  </View>
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{items.length}</Text>
                  </View>
                </View>

                {items.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Ionicons name="basket-outline" size={26} color={colors.accent} />
                    </View>
                    <Text style={styles.emptyTitle}>Your list is empty</Text>
                    <Text style={styles.emptyText}>Items you add will appear here with their detected departments.</Text>
                  </View>
                ) : (
                  <View>
                    {items.map((item, index) => {
                      const tone = departmentTone(item.department, isDark);
                      return (
                        <View key={item.id} style={[styles.listRow, index === items.length - 1 && styles.lastRow]}>
                          <View style={styles.listIndex}>
                            <Text style={styles.listIndexText}>{index + 1}</Text>
                          </View>
                          <View style={styles.itemCopy}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            <View style={[styles.departmentPill, { backgroundColor: tone.background }]}>
                              <Text style={[styles.departmentPillText, { color: tone.text }]}>{item.department}</Text>
                            </View>
                          </View>
                          {item.quantity ? (
                            <View style={styles.qtyBadge}>
                              <Text style={styles.qtyText}>×{item.quantity}</Text>
                            </View>
                          ) : null}
                          <TouchableOpacity
                            accessibilityLabel={`Remove ${item.name}`}
                            activeOpacity={0.75}
                            onPress={() => removeItem(item.id)}
                            style={styles.deleteButton}
                          >
                            <Ionicons name="close" size={18} color={colors.muted} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.listFooter}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={[styles.primaryButton, !items.length && styles.disabledButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      if (items.length) setTab('order');
                    }}
                    disabled={!items.length}
                  >
                    <Text style={styles.primaryButtonText}>Build optimized route</Text>
                    <Ionicons name="arrow-forward" size={19} color={colors.onAccent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {tab === 'order' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
          <View style={styles.contentContainer}>
            <View style={styles.pageHeaderRow}>
              <View>
                <Text style={styles.eyebrow}>OPTIMIZED ROUTE</Text>
                <Text style={styles.pageTitle}>Your fastest shopping order</Text>
                <Text style={styles.pageSubtitle}>Optimized for walking distance while keeping refrigerated and frozen items later when practical.</Text>
              </View>
              {isWide ? (
                <View style={styles.routeStatusChip}>
                  <View style={styles.routeStatusDot} />
                  <Text style={styles.routeStatusText}>Route ready</Text>
                </View>
              ) : null}
            </View>

            {items.length === 0 ? (
              <EmptyScreen
                icon="git-branch-outline"
                title="No route yet"
                text="Add at least one item to your shopping list before optimizing the route."
                buttonLabel="Go to shopping list"
                onPress={() => setTab('list')}
                styles={styles}
                colors={colors}
              />
            ) : (
              <>
                {isWide ? (
                  <>
                    <View style={styles.metricsRow}>
                      <Metric label="Estimated time" value={`${routeEstimate.estimatedMinutes} min`} icon="time-outline" styles={styles} colors={colors} />
                      <Metric label="Estimated walk" value={formatDistance(routeEstimate.optimizedDistanceFeet)} icon="walk-outline" styles={styles} colors={colors} />
                      <Metric label="Time saved" value={`${routeEstimate.timeSavedMinutes} min`} icon="speedometer-outline" styles={styles} colors={colors} />
                    </View>

                    <View style={styles.progressCard}>
                      <View style={styles.progressHeader}>
                        <View>
                          <Text style={styles.progressLabel}>Shopping progress</Text>
                          <Text style={styles.progressValue}>{completed} of {items.length} items collected</Text>
                        </View>
                        <Text style={styles.progressPercent}>{completionPercent}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${completionPercent}%` as `${number}%` }]} />
                      </View>
                    </View>
                  </>
                ) : null}

                <View style={styles.routeCard}>
                  <View style={styles.routeCardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>Collection order</Text>
                      <Text style={styles.cardSubtitle}>Tap an item as you collect it.</Text>
                    </View>
                    <View style={styles.stopsChip}>
                      <Ionicons name="location-outline" size={15} color={colors.accent} />
                      <Text style={styles.stopsChipText}>{departmentStops.length} stops</Text>
                    </View>
                  </View>

                  {route.map((item, index) => {
                    const isChecked = Boolean(checked[item.id]);
                    const tone = departmentTone(item.department, isDark);
                    return (
                      <TouchableOpacity
                        activeOpacity={0.82}
                        style={[styles.orderRow, index === route.length - 1 && styles.orderRowLastItem]}
                        key={item.id}
                        onPress={() => setChecked((previous) => ({ ...previous, [item.id]: !previous[item.id] }))}
                      >
                        <View style={[styles.stepBadge, isChecked && styles.stepBadgeDone]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={16} color={colors.onAccent} />
                          ) : (
                            <Text style={styles.stepBadgeText}>{index + 1}</Text>
                          )}
                        </View>

                        <View style={styles.orderCopy}>
                          <Text style={[styles.orderItem, isChecked && styles.checkedText]}>
                            {item.name}{item.quantity ? `  ×${item.quantity}` : ''}
                          </Text>
                          <View style={[styles.departmentPill, { backgroundColor: tone.background }]}>
                            <Text style={[styles.departmentPillText, { color: tone.text }]}>{item.department}</Text>
                          </View>
                        </View>

                        <Ionicons
                          name={isChecked ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isChecked ? colors.success : colors.borderStrong}
                        />
                      </TouchableOpacity>
                    );
                  })}

                  <View style={styles.checkoutRow}>
                    <View style={styles.checkoutBadge}>
                      <Ionicons name="card-outline" size={16} color={colors.accent} />
                    </View>
                    <View style={styles.orderCopy}>
                      <Text style={styles.checkoutTitle}>Checkout</Text>
                      <Text style={styles.checkoutText}>Finish at the front registers.</Text>
                    </View>
                    <Ionicons name="flag-outline" size={22} color={colors.accent} />
                  </View>
                </View>

                {!isWide ? (
                  <View style={styles.phoneRouteSummary}>
                    <Text style={styles.phoneRouteSummaryLine}>
                      <Text style={styles.phoneRouteSummaryStrong}>{routeEstimate.estimatedMinutes} min</Text>
                      {'  estimated  ·  '}
                      <Text style={styles.phoneRouteSummaryStrong}>{formatDistance(routeEstimate.optimizedDistanceFeet)}</Text>
                      {'  walk  ·  '}
                      <Text style={styles.phoneRouteSummaryStrong}>{routeEstimate.timeSavedMinutes} min</Text>
                      {'  saved'}
                    </Text>

                    <View style={styles.phoneProgressRow}>
                      <Text style={styles.phoneProgressText}>
                        {completed} of {items.length} collected
                      </Text>
                      <Text style={styles.phoneProgressPercent}>{completionPercent}%</Text>
                    </View>

                    <View style={styles.phoneProgressTrack}>
                      <View
                        style={[
                          styles.phoneProgressFill,
                          { width: `${completionPercent}%` as `${number}%` },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}

                <Text style={styles.estimateNote}>
                  Estimates are calculated from the store map, average cart-walking speed, and pickup time per item.
                </Text>

                <View style={styles.routeActionRow}>
                  <TouchableOpacity activeOpacity={0.88} style={styles.secondaryRouteButton} onPress={() => setTab('map')}>
                    <Ionicons name="map-outline" size={19} color={colors.accent} />
                    <Text style={styles.secondaryRouteButtonText}>View store map</Text>
                  </TouchableOpacity>

                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {tab === 'map' && (
        <View style={styles.mapScreenContent}>
          <View style={styles.mapContentContainer}>
            <View style={styles.mapHeaderRow}>
              <View>
                <Text style={styles.eyebrow}>STORE MAP</Text>
                <Text style={styles.pageTitle}>Department stops</Text>
              </View>
              <View style={styles.mapStopChip}>
                <Ionicons name="location" size={16} color={colors.accent} />
                <Text style={styles.mapStopValue}>{departmentStops.length}</Text>
                <Text style={styles.mapStopLabel}>{departmentStops.length === 1 ? 'stop' : 'stops'}</Text>
              </View>
            </View>

            <View style={[styles.mapCard, { width: mapWidth }]}>
              <View style={[styles.mapToolbar, !isWide && styles.mapToolbarPhone]}>
                <View style={styles.mapStoreCopy}>
                  <Text style={styles.mapStoreName}>{currentStore.name}</Text>
                  <Text style={styles.mapStoreMeta}>{currentStore.address}</Text>

                  {!isWide ? (
                    <View style={[styles.liveBadge, styles.liveBadgeBelow]}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>Optimized route</Text>
                    </View>
                  ) : null}
                </View>

                {isWide ? (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>Optimized route</Text>
                  </View>
                ) : null}
              </View>
              <StoreMap departmentStops={departmentStops} store={activeRouteStore} styles={styles} colors={colors} />
            </View>
          </View>
        </View>
      )}

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={ITEM_INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Dismiss keyboard"
              activeOpacity={0.75}
              style={styles.keyboardDoneButton}
              onPress={Keyboard.dismiss}
            >
              <Text style={styles.keyboardDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      ) : null}

      <View style={styles.navShell} pointerEvents="box-none">
        <View style={styles.navDock}>
          <TabButton label="List" icon="list-outline" active={tab === 'list'} onPress={() => setTab('list')} styles={styles} colors={colors} />
          <TabButton label="Order" icon="git-branch-outline" active={tab === 'order'} onPress={() => setTab('order')} styles={styles} colors={colors} />
          <TabButton label="Map" icon="map-outline" active={tab === 'map'} onPress={() => setTab('map')} styles={styles} colors={colors} />
        </View>
      </View>
    </SafeAreaView>
  );
}

type AppStyles = ReturnType<typeof createStyles>;

function Metric({ label, value, icon, styles, colors }: { label: string; value: string; icon: IconName; styles: AppStyles; colors: ThemeColors }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function EmptyScreen({
  icon,
  title,
  text,
  buttonLabel,
  onPress,
  styles,
  colors,
}: {
  icon: IconName;
  title: string;
  text: string;
  buttonLabel: string;
  onPress: () => void;
  styles: AppStyles;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.emptyScreenCard}>
      <View style={styles.emptyScreenIcon}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={styles.emptyScreenTitle}>{title}</Text>
      <Text style={styles.emptyScreenText}>{text}</Text>
      <TouchableOpacity activeOpacity={0.85} style={styles.emptyScreenButton} onPress={onPress}>
        <Text style={styles.emptyScreenButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
  styles,
  colors,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
  styles: AppStyles;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
    >
      <Ionicons name={icon} size={20} color={active ? colors.accent : colors.muted} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StoreMap({
  departmentStops,
  store,
  styles,
  colors,
}: {
  departmentStops: DepartmentStop[];
  store: StoreConfig;
  styles: AppStyles;
  colors: ThemeColors;
}) {
  const routePoints = [
    `${store.entrance.x},${store.entrance.y}`,
    ...departmentStops.map((stop) => `${stop.x},${stop.y}`),
    `${store.checkout.x},${store.checkout.y}`,
  ].join(' ');

  return (
    <View style={[styles.realMapContainer, { aspectRatio: store.mapWidth / store.mapHeight }]}>
      <Image
        source={store.mapSource}
        style={styles.realMapImage}
        resizeMode="contain"
        accessibilityLabel={`${store.name} floor map`}
      />
      <Svg
        viewBox={`0 0 ${store.mapWidth} ${store.mapHeight}`}
        style={styles.routeOverlay}
        preserveAspectRatio="xMidYMid meet"
      >
        {departmentStops.length > 0 ? (
          <Polyline
            points={routePoints}
            fill="none"
            stroke={colors.accent}
            strokeWidth="4"
            strokeOpacity="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {departmentStops.map((stop) => (
          <React.Fragment key={stop.id}>
            <Circle cx={stop.x} cy={stop.y} r="12" fill={colors.accent} stroke={colors.onAccent} strokeWidth="2.75" />
            <SvgText
              x={stop.x}
              y={stop.y + 4.25}
              fill={colors.onAccent}
              fontWeight="800"
              fontSize="13"
              textAnchor="middle"
            >
              {stop.number}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appHeader: {
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
    zIndex: 100,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexShrink: 0,
  },
  headerIconButton: {
    width: 42,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  headerIconButtonActive: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  themeToggle: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeToggleCompact: {
    width: 42,
    minWidth: 42,
    paddingHorizontal: 0,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  brandRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  brandCaption: {
    marginTop: 1,
    fontSize: 11,
    color: colors.muted,
  },
  storeChip: {
    maxWidth: 230,
    flexShrink: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  storeChipWide: {
    maxWidth: 280,
    flexShrink: 0,
  },
  storeChipText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  locationMenu: {
    position: 'absolute',
    top: 64,
    right: 20,
    width: 300,
    maxWidth: '88%',
    zIndex: 200,
    elevation: 18,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  locationMenuWide: {
    right: 58,
    width: 330,
  },
  locationMenuLabel: {
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 7,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.muted,
  },
  locationMenuOptions: {
    gap: 8,
  },
  locationMenuOption: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationMenuOptionSelected: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  locationMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationMenuCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationMenuTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  locationMenuAddress: {
    marginTop: 3,
    fontSize: 11,
    color: colors.muted,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 118,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
  },
  pageIntro: {
    marginBottom: 24,
    gap: 18,
  },
  pageIntroWide: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageIntroCopy: {
    maxWidth: 720,
  },
  eyebrow: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.accent,
  },
  title: {
    maxWidth: 700,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subtitle: {
    maxWidth: 690,
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted,
  },
  summaryBadge: {
    minWidth: 126,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  summaryValue: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.ink,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  workspace: {
    gap: 18,
  },
  workspaceWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputPanel: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputPanelWide: {
    flex: 0.82,
  },
  listPanel: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  listPanelWide: {
    flex: 1.18,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeadingCopy: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  listInput: {
    minHeight: 170,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  keyboardAccessory: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  keyboardDoneButton: {
    minHeight: 36,
    minWidth: 64,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  inputActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  addButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onAccent,
  },
  disabledButton: {
    opacity: 0.42,
  },
  cardHeader: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.muted,
  },
  countPill: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
  },
  emptyState: {
    minHeight: 260,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyText: {
    maxWidth: 330,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.muted,
  },
  listRow: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  listIndex: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
  },
  itemCopy: {
    flex: 1,
    alignItems: 'flex-start',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  departmentPill: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  departmentPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  qtyBadge: {
    minWidth: 34,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonWide: {
    alignSelf: 'flex-start',
    minHeight: 50,
    marginTop: 16,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onAccent,
  },
  pageHeaderRow: {
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 18,
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.ink,
  },
  pageSubtitle: {
    maxWidth: 650,
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  routeStatusChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.successBorder,
    backgroundColor: colors.successSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  routeStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  routeStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 170,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metricIcon: {
    width: 34,
    height: 34,
    marginBottom: 14,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  metricValue: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: colors.ink,
  },
  progressCard: {
    marginBottom: 14,
    padding: 17,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  progressValue: {
    marginTop: 3,
    fontSize: 12,
    color: colors.muted,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  progressTrack: {
    height: 7,
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.progressTrack,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  routeCard: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  phoneRouteSummary: {
    marginTop: 14,
    paddingHorizontal: 2,
  },
  phoneRouteSummaryLine: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
  },
  phoneRouteSummaryStrong: {
    fontWeight: '800',
    color: colors.ink,
  },
  phoneProgressRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  phoneProgressText: {
    fontSize: 12,
    color: colors.muted,
  },
  phoneProgressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
  },
  phoneProgressTrack: {
    height: 4,
    marginTop: 7,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
  },
  phoneProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  routeCardHeader: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  stopsChip: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stopsChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
  },
  orderRow: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderRowLastItem: {
    borderBottomWidth: 1,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: {
    backgroundColor: colors.success,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onAccent,
  },
  orderCopy: {
    flex: 1,
    alignItems: 'flex-start',
  },
  orderItem: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  checkedText: {
    color: colors.subtle,
    textDecorationLine: 'line-through',
  },
  checkoutRow: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkoutBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  checkoutText: {
    marginTop: 3,
    fontSize: 11,
    color: colors.muted,
  },
  estimateNote: {
    maxWidth: 700,
    marginTop: 12,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
  },
  emptyScreenCard: {
    minHeight: 340,
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScreenIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScreenTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyScreenText: {
    maxWidth: 420,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.muted,
  },
  emptyScreenButton: {
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScreenButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onAccent,
  },
  mapScreenContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 104,
    alignItems: 'center',
  },
  mapContentContainer: {
    width: '100%',
    maxWidth: 1080,
    alignItems: 'center',
  },
  mapHeaderRow: {
    width: '100%',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 18,
  },
  mapStopChip: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mapStopValue: {
    marginLeft: 2,
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  mapStopLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  mapCard: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  mapToolbar: {
    minHeight: 62,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapToolbarPhone: {
    alignItems: 'flex-start',
  },
  mapStoreCopy: {
    flex: 1,
    minWidth: 0,
  },
  mapStoreName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  mapStoreMeta: {
    marginTop: 3,
    fontSize: 11,
    color: colors.muted,
  },
  liveBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  liveBadgeBelow: {
    marginTop: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  realMapContainer: {
    width: '100%',
    aspectRatio: 1536 / 1024,
    position: 'relative',
    backgroundColor: colors.mapSurface,
  },
  realMapImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  routeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  routeActionRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryRouteButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryRouteButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
  },
  navShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  navDock: {
    width: '90%',
    maxWidth: 420,
    height: 66,
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    shadowColor: colors.shadow,
    shadowOpacity: 0.11,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabButtonActive: {
    backgroundColor: colors.accentSoft,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.accent,
  },
  });
}
