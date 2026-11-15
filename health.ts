import { requireOptionalNativeModule } from 'expo';
import type { CategorySample, WorkoutSample } from '@appeeky/expo-healthkit';
import type { FitlogData, DailyActivityEntry, PeriodCycleEntry, SleepEntry, WorkoutEntry } from './tracker';
import { localDateKey } from './tracker';

type HealthKitApi = typeof import('@appeeky/expo-healthkit');

let cachedHealthKit: HealthKitApi | null = null;

function getHealthKit(): HealthKitApi {
  if (cachedHealthKit) return cachedHealthKit;

  // Check the native registry before loading the JS wrapper. Expo Go does not
  // bundle third-party HealthKit code; calling require() first would emit
  // "Cannot find native module 'ExpoHealthKit'" in the running app.
  const nativeModule = requireOptionalNativeModule('ExpoHealthKit');
  if (!nativeModule) {
    throw new Error('Apple Health needs the Fitlog iOS development build. Expo Go does not include native HealthKit. Your other Fitlog screens should still work normally.');
  }

  try {
    cachedHealthKit = require('@appeeky/expo-healthkit') as HealthKitApi;
    return cachedHealthKit;
  } catch {
    throw new Error('Fitlog could not initialise Apple Health. Rebuild the iOS development app after installing the HealthKit package.');
  }
}

export type HealthSyncOptions = {
  requestAuthorization?: boolean;
  registerBackgroundDelivery?: boolean;
  reason?: 'manual' | 'background';
};

export type HealthSyncSummary = {
  steps: number | null;
  activeCalories: number | null;
  workoutsImported: number;
  sleepNightsImported: number;
  periodsImported: number;
  checkedAt: number;
  backgroundDeliveryEnabled: boolean;
  queryWarnings: string[];
};

export type HealthSyncResult = {
  data: FitlogData;
  summary: HealthSyncSummary;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function labelForWorkout(activityType: number): string {
  const labels: Record<number, string> = {
    8: 'Boxing',
    11: 'Cross training',
    13: 'Cycling',
    16: 'Elliptical',
    20: 'Strength training',
    24: 'Hiking',
    29: 'Mind & body',
    35: 'Rowing',
    37: 'Running',
    44: 'Stair climbing',
    46: 'Swimming',
    50: 'Strength training',
    52: 'Walking',
    57: 'Yoga',
    59: 'Core training',
    63: 'HIIT',
    64: 'Skipping',
    66: 'Pilates',
    72: 'Tai chi',
  };
  return labels[activityType] ?? 'Workout';
}

function isAsleepValue(value: number, hk: HealthKitApi): boolean {
  return value === hk.SleepAnalysisValue.asleepUnspecified ||
    value === hk.SleepAnalysisValue.asleepCore ||
    value === hk.SleepAnalysisValue.asleepDeep ||
    value === hk.SleepAnalysisValue.asleepREM;
}

function sleepNightDate(sample: CategorySample): string {
  // Sleep segments ending in the evening usually belong to the following night.
  const bucket = new Date(sample.endDate);
  if (bucket.getHours() >= 18) bucket.setDate(bucket.getDate() + 1);
  return localDateKey(bucket);
}

function unionedSleepHours(samples: CategorySample[]): number {
  const intervals = samples
    .map(sample => ({ start: sample.startDate.getTime(), end: sample.endDate.getTime() }))
    .filter(interval => Number.isFinite(interval.start) && Number.isFinite(interval.end) && interval.end > interval.start)
    .sort((a, b) => a.start - b.start);

  if (intervals.length === 0) return 0;

  let totalMs = 0;
  let activeStart = intervals[0].start;
  let activeEnd = intervals[0].end;

  for (const interval of intervals.slice(1)) {
    if (interval.start <= activeEnd) {
      activeEnd = Math.max(activeEnd, interval.end);
    } else {
      totalMs += activeEnd - activeStart;
      activeStart = interval.start;
      activeEnd = interval.end;
    }
  }
  totalMs += activeEnd - activeStart;
  return Math.round((totalMs / 3_600_000) * 100) / 100;
}

function toWorkoutEntry(workout: WorkoutSample): WorkoutEntry {
  return {
    id: 'healthkit-' + workout.uuid,
    healthKitId: workout.uuid,
    source: 'healthkit',
    date: localDateKey(workout.startDate),
    name: labelForWorkout(workout.workoutActivityType),
    category: 'Apple Health',
    minutes: Math.max(1, Math.round(workout.duration / 60)),
    activeCalories: workout.totalEnergyBurnedUnit === 'kcal' && workout.totalEnergyBurned != null
      ? Math.round(workout.totalEnergyBurned)
      : undefined,
    healthKitActivityType: workout.workoutActivityType,
    createdAt: workout.startDate.getTime(),
  };
}

function mergeWorkouts(existing: WorkoutEntry[], imported: WorkoutEntry[]): WorkoutEntry[] {
  const byHealthKitId = new Map<string, WorkoutEntry>();
  const manual: WorkoutEntry[] = [];

  for (const item of existing) {
    if (item.source === 'healthkit' && item.healthKitId) byHealthKitId.set(item.healthKitId, item);
    else manual.push(item);
  }
  for (const item of imported) {
    if (item.healthKitId) byHealthKitId.set(item.healthKitId, item);
  }
  return [...manual, ...byHealthKitId.values()].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
}

function buildSleepEntries(samples: CategorySample[], hk: HealthKitApi): SleepEntry[] {
  const grouped = new Map<string, CategorySample[]>();
  for (const sample of samples) {
    if (!isAsleepValue(sample.value, hk)) continue;
    const date = sleepNightDate(sample);
    const group = grouped.get(date) ?? [];
    group.push(sample);
    grouped.set(date, group);
  }

  return [...grouped.entries()].map(([date, group]) => ({
    id: 'healthkit-sleep-' + date,
    date,
    hours: unionedSleepHours(group),
    source: 'healthkit' as const,
    healthKitSampleIds: group.map(sample => sample.uuid),
  })).filter(entry => entry.hours > 0);
}

function mergeSleep(existing: SleepEntry[], imported: SleepEntry[]): SleepEntry[] {
  const importedDates = new Set(imported.map(entry => entry.date));
  const keep = existing.filter(entry => !(entry.source === 'healthkit' && importedDates.has(entry.date)));
  return [...keep, ...imported].sort((a, b) => a.date.localeCompare(b.date));
}

const MENSTRUAL_CYCLE_START_KEY = 'HKMetadataKeyMenstrualCycleStart';

function isCycleStart(sample: CategorySample): boolean {
  const marker = sample.metadata?.[MENSTRUAL_CYCLE_START_KEY];
  return marker != null && ['true', '1', 'yes'].includes(String(marker).trim().toLowerCase());
}

function flowLabel(value: number): PeriodCycleEntry['flow'] | null {
  if (value === 4) return 'heavy';
  if (value === 3) return 'medium';
  if (value === 2) return 'light';
  if (value === 1) return 'unspecified';
  // HealthKit's deprecated .none value is 5, so it is deliberately not recorded as a period day.
  return null;
}

function buildPeriodCycles(samples: CategorySample[]): PeriodCycleEntry[] {
  const sorted = samples
    .filter(sample => flowLabel(sample.value) !== null)
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const cycles: PeriodCycleEntry[] = [];
  let previousSampleEnd: number | null = null;
  const severity: Record<PeriodCycleEntry['flow'], number> = {
    unspecified: 1,
    light: 2,
    medium: 3,
    heavy: 4,
  };

  for (const sample of sorted) {
    const hasMarker = sample.metadata?.[MENSTRUAL_CYCLE_START_KEY] != null;
    const gapDays = previousSampleEnd == null
      ? Number.POSITIVE_INFINITY
      : (sample.startDate.getTime() - previousSampleEnd) / 86_400_000;
    // Apple marks the first sample of each period explicitly. Older third-party
    // records without that metadata are only split after a clear multi-day gap.
    const startsNewCycle = cycles.length === 0 || isCycleStart(sample) || (!hasMarker && gapDays > 4);
    const flow = flowLabel(sample.value)!;

    if (startsNewCycle) {
      cycles.push({
        id: 'healthkit-period-' + localDateKey(sample.startDate),
        startDate: localDateKey(sample.startDate),
        endDate: localDateKey(sample.endDate),
        flow,
        source: 'healthkit',
        healthKitSampleIds: [sample.uuid],
      });
    } else {
      const current = cycles[cycles.length - 1];
      if (localDateKey(sample.endDate) > current.endDate) current.endDate = localDateKey(sample.endDate);
      if (severity[flow] > severity[current.flow]) current.flow = flow;
      current.healthKitSampleIds.push(sample.uuid);
    }
    previousSampleEnd = Math.max(previousSampleEnd ?? 0, sample.endDate.getTime());
  }

  return cycles;
}

function mergePeriodCycles(existing: PeriodCycleEntry[] | undefined, imported: PeriodCycleEntry[]): PeriodCycleEntry[] {
  const manualOrOther = (existing ?? []).filter(entry => entry.source !== 'healthkit');
  return [...manualOrOther, ...imported].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function syncAppleHealth(
  current: FitlogData,
  options: HealthSyncOptions = {}
): Promise<HealthSyncResult> {
  const hk = getHealthKit();
  if (!hk.isAvailable()) {
    throw new Error('Apple Health is not available on this iPhone. Check that the Health app is enabled and try again.');
  }

  const readTypes = [
    hk.QuantityType.stepCount,
    hk.QuantityType.activeEnergyBurned,
    hk.CategoryType.sleepAnalysis,
    hk.CategoryType.menstrualFlow,
    hk.WorkoutType.workout,
  ];

  if (options.requestAuthorization !== false) {
    await hk.requestAuthorization({ toRead: readTypes });
  }

  let backgroundDeliveryEnabled = current.healthSync?.backgroundDeliveryEnabled ?? false;
  if (options.registerBackgroundDelivery) {
    try {
      await hk.observe(readTypes);
      const registrations = await Promise.allSettled(
        readTypes.map(type => hk.enableBackgroundDelivery(type, hk.UpdateFrequency.hourly))
      );
      backgroundDeliveryEnabled = registrations.length === readTypes.length && registrations.every(
        result => result.status === 'fulfilled' && result.value === true
      );
    } catch {
      backgroundDeliveryEnabled = false;
    }
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const historyStart = addDays(todayStart, -13);
  const cycleHistoryStart = addDays(todayStart, -730);
  const warnings: string[] = [];

  const [stepsResult, energyResult, workoutsResult, sleepResult, menstrualResult] = await Promise.all([
    hk.queryStatistics({
      type: hk.QuantityType.stepCount,
      unit: hk.Unit.count,
      from: todayStart,
      to: now,
      options: hk.StatisticsOption.cumulativeSum,
    }).catch(error => {
      warnings.push('Steps could not be read: ' + (error instanceof Error ? error.message : 'unknown error'));
      return null;
    }),
    hk.queryStatistics({
      type: hk.QuantityType.activeEnergyBurned,
      unit: hk.Unit.kilocalorie,
      from: todayStart,
      to: now,
      options: hk.StatisticsOption.cumulativeSum,
    }).catch(error => {
      warnings.push('Active energy could not be read: ' + (error instanceof Error ? error.message : 'unknown error'));
      return null;
    }),
    hk.queryWorkouts({ from: historyStart, to: now, ascending: false }).catch(error => {
      warnings.push('Workouts could not be read: ' + (error instanceof Error ? error.message : 'unknown error'));
      return [] as WorkoutSample[];
    }),
    hk.queryCategorySamples({
      type: hk.CategoryType.sleepAnalysis,
      from: historyStart,
      to: now,
      ascending: false,
    }).catch(error => {
      warnings.push('Sleep could not be read: ' + (error instanceof Error ? error.message : 'unknown error'));
      return [] as CategorySample[];
    }),
    hk.queryCategorySamples({
      type: hk.CategoryType.menstrualFlow,
      from: cycleHistoryStart,
      to: now,
      ascending: true,
    }).catch(error => {
      warnings.push('Period history could not be read: ' + (error instanceof Error ? error.message : 'unknown error'));
      return [] as CategorySample[];
    }),
  ]);

  const todayKey = localDateKey(now);
  const oldActivity = current.activityByDate?.[todayKey];
  const hasSteps = stepsResult?.sum != null && Number.isFinite(stepsResult.sum);
  const hasEnergy = energyResult?.sum != null && Number.isFinite(energyResult.sum);
  const syncedActivity: DailyActivityEntry | undefined = hasSteps || hasEnergy
    ? {
        date: todayKey,
        steps: hasSteps ? Math.round(stepsResult!.sum!) : oldActivity?.steps,
        activeCalories: hasEnergy ? Math.round(energyResult!.sum!) : oldActivity?.activeCalories,
        source: 'healthkit',
      }
    : undefined;

  const importedWorkouts = workoutsResult.map(toWorkoutEntry);
  const importedSleep = buildSleepEntries(sleepResult, hk);
  const importedPeriods = buildPeriodCycles(menstrualResult);

  const nextData: FitlogData = {
    ...current,
    workouts: mergeWorkouts(current.workouts, importedWorkouts),
    sleep: mergeSleep(current.sleep, importedSleep),
    periodCycles: mergePeriodCycles(current.periodCycles, importedPeriods),
    activityByDate: syncedActivity
      ? { ...(current.activityByDate ?? {}), [todayKey]: syncedActivity }
      : current.activityByDate,
    healthSync: {
      setupRequested: true,
      lastSyncAt: now.getTime(),
      lastSyncReason: options.reason ?? 'manual',
      backgroundDeliveryEnabled,
    },
  };

  return {
    data: nextData,
    summary: {
      steps: syncedActivity?.steps ?? null,
      activeCalories: syncedActivity?.activeCalories ?? null,
      workoutsImported: importedWorkouts.length,
      sleepNightsImported: importedSleep.length,
      periodsImported: importedPeriods.length,
      checkedAt: now.getTime(),
      backgroundDeliveryEnabled,
      queryWarnings: warnings,
    },
  };
}

export function subscribeToAppleHealthUpdates(listener: () => Promise<void>): { remove: () => void } | null {
  try {
    return getHealthKit().addUpdateListener(() => listener());
  } catch {
    return null;
  }
}
