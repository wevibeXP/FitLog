import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  ScrollView,
  StatusBar,
  StyleProp,
  ViewStyle,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DeviceMotion, Pedometer } from 'expo-sensors';
import Onboarding from './Onboarding';
import { assess, AssessmentInput } from './assessment';
import { estimateFood, searchFoods, suggestAmount } from './nutrition';
import type { NutritionFood, NutritionUnit, FoodEstimate } from './nutrition';
import {
  createInitialData,
  FitlogData,
  FoodEntry,
  MealType,
  makeId,
  localDateKey,
  WorkoutEntry,
} from './tracker';
import type { CycleJournalEntry } from './tracker';
import { clearFitlogData, loadFitlogData, saveFitlogData } from './storage';
import FitlogMotion, {
  type NativeMotionCapabilities,
  type NativePedometerSnapshot,
} from './modules/fitlog-motion';

const C = {
  bg: '#FFF9F4',
  panel: '#FFFFFF',
  text: '#393340',
  muted: '#897F8D',
  accent: '#9A83D4',
  line: '#EAE1EB',
  mint: '#E2F1E8',
  peach: '#FBE8DF',
  butter: '#FFF2D8',
  lilac: '#F0EAFB',
  green: '#547A66',
  rose: '#9C6955',
};

type Tab = 'today' | 'food' | 'move' | 'progress' | 'cycle';
type UpdateData = (recipe: (current: FitlogData) => FitlogData) => void;

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: C.panel, borderRadius: 23, borderWidth: 1, borderColor: C.line, padding: 18, marginBottom: 14, shadowColor: '#7D688D', shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 }, style]}>{children}</View>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }}>{children}</Text>;
}

function PageTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <View style={{ marginBottom: 21 }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Text style={{ color: C.text, fontSize: 30, fontWeight: '900', letterSpacing: 0.1, marginTop: 8 }}>{title}</Text>
    <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{subtitle}</Text>
  </View>;
}

function ActionButton({ label, onPress, disabled = false, tone = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'primary' | 'soft' | 'outline' }) {
  const backgroundColor = tone === 'primary' ? (disabled ? '#EDE7EF' : C.accent) : tone === 'soft' ? C.lilac : C.panel;
  const borderColor = tone === 'outline' ? C.line : backgroundColor;
  const color = disabled ? '#A99EAC' : tone === 'primary' ? '#FFFFFF' : C.accent;
  return <TouchableOpacity activeOpacity={0.84} disabled={disabled} onPress={onPress} style={{ backgroundColor, borderWidth: 1, borderColor, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 }}>{label}</Text>
  </TouchableOpacity>;
}

function TextField({ label, value, onChange, placeholder, keyboardType = 'default', suffix }: {
  label: string; value: string; onChange: (value: string) => void; placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'; suffix?: string;
}) {
  return <View style={{ marginBottom: 13 }}>
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 7 }}>{label}{suffix ? '  ·  ' + suffix : ''}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#B0A6B1"
      keyboardType={keyboardType}
      selectionColor={C.accent}
      style={{ backgroundColor: '#FFFCFA', borderColor: C.line, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 13, color: C.text, fontSize: 15 }}
    />
  </View>;
}

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const width = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  return <View style={{ height: 8, backgroundColor: '#F1ECF1', borderRadius: 8, overflow: 'hidden', marginTop: 7 }}>
    <View style={{ height: 8, width: width + '%', backgroundColor: color, borderRadius: 8 }} />
  </View>;
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} style={{ paddingVertical: 9, paddingHorizontal: 13, backgroundColor: selected ? C.lilac : C.panel, borderRadius: 30, borderWidth: 1, borderColor: selected ? C.accent : C.line, marginRight: 7, marginBottom: 7 }}>
    <Text style={{ color: selected ? C.accent : C.muted, fontWeight: '800', fontSize: 11 }}>{label}</Text>
  </TouchableOpacity>;
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return <View style={{ alignItems: 'center', paddingVertical: 22, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 28 }}>{emoji}</Text>
    <Text style={{ color: C.text, fontWeight: '900', marginTop: 9 }}>{title}</Text>
    <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
  </View>;
}

function MovementMetric({ emoji, label, value, detail, tint }: { emoji: string; label: string; value: string; detail: string; tint: string }) {
  return <View style={{ width: '48.5%', backgroundColor: tint, borderRadius: 16, padding: 13, marginBottom: 9 }}>
    <Text style={{ fontSize: 17 }}>{emoji}</Text>
    <Text style={{ color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginTop: 8 }}>{label}</Text>
    <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginTop: 5 }}>{value}</Text>
    <Text style={{ color: C.muted, fontSize: 9, lineHeight: 13, marginTop: 4 }}>{detail}</Text>
  </View>;
}


type DailyActivity = NonNullable<FitlogData['activityByDate']>[string];

type ActiveEnergyEstimate = {
  calories: number | null;
  isReported: boolean;
  detail: string;
};

function calculateActiveEnergy({
  steps,
  activity,
  workouts,
  weightKg,
  heightCm,
  age,
  needsReview,
}: {
  steps: number | null;
  activity?: DailyActivity;
  workouts: WorkoutEntry[];
  weightKg: number;
  heightCm: number;
  age: number;
  needsReview: boolean;
}): ActiveEnergyEstimate {
  const restingEnergyAllowed = age >= 18 && !needsReview;
  const stepLengthMeters = (heightCm / 100) * 0.415;
  const metByCategory: Record<string, number> = {
    strength: 3.5, pilates: 3, walk: 3.3, run: 7, cycling: 6, mobility: 2, other: 3,
  };
  const motionSessionSteps = workouts.reduce((sum, item) =>
    sum + (item.source === 'motion' ? (item.steps ?? 0) : 0), 0);
  const estimatedStepsInManualWalkingSessions = workouts.reduce((sum, item) => {
    if (item.source === 'motion' && item.steps != null) return sum;
    const type = item.category.toLowerCase();
    const estimatedCadence = type === 'walk' ? 100 : type === 'run' ? 160 : 0;
    return sum + item.minutes * estimatedCadence;
  }, 0);

  // Keep steps already attributed to a logged session out of the daily step estimate.
  const nonSessionSteps = steps == null
    ? 0
    : Math.max(0, steps - motionSessionSteps - estimatedStepsInManualWalkingSessions);
  const totalStepDistanceMeters = activity?.distanceMeters != null
    ? activity.distanceMeters
    : (steps ?? 0) * stepLengthMeters;
  const nonSessionDistanceMeters = steps != null && steps > 0
    ? totalStepDistanceMeters * (nonSessionSteps / steps)
    : 0;
  const stepCalories = restingEnergyAllowed && steps != null
    ? (nonSessionDistanceMeters / 1000) * weightKg * 0.5
    : 0;
  const hasStepCalories = restingEnergyAllowed && steps != null;
  const hasRecordedWorkoutCalories = workouts.some(item => item.activeCalories != null);
  const hasEstimatedWorkoutCalories = workouts.some(item => item.activeCalories == null) && restingEnergyAllowed;
  const workoutCalories = workouts.reduce((sum, item) => {
    if (item.activeCalories != null) return sum + item.activeCalories;
    if (!restingEnergyAllowed) return sum;
    const met = metByCategory[item.category.toLowerCase()] ?? 3;
    return sum + Math.max(0, (met - 1) * 3.5 * weightKg / 200) * item.minutes;
  }, 0);
  const hasEstimate = hasStepCalories || hasRecordedWorkoutCalories || hasEstimatedWorkoutCalories;
  const savedDailyActiveCalories = activity?.activeCalories;

  if (savedDailyActiveCalories != null) {
    return {
      calories: savedDailyActiveCalories,
      isReported: true,
      detail: 'Full-day value saved from another source',
    };
  }

  if (hasEstimate && restingEnergyAllowed) {
    return {
      calories: stepCalories + workoutCalories,
      isReported: false,
      detail: 'Steps ~' + Math.round(stepCalories) + ' + sessions ~' + Math.round(workoutCalories) + ' kcal',
    };
  }

  return {
    calories: null,
    isReported: false,
    detail: 'Steps and workout energy estimates unavailable',
  };
}

function shiftDateKey(dateKey: string, offset: number): string {
  const date = new Date(dateKey + 'T12:00:00');
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}

function formatDateLabel(dateKey: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(dateKey + 'T12:00:00'));
}

function DateNavigator({ selectedDate, onChange, disabled = false }: {
  selectedDate: string; onChange: (date: string) => void; disabled?: boolean;
}) {
  const isToday = selectedDate === localDateKey();
  return <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1,
    borderColor: C.line, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 16,
  }}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous day" disabled={disabled}
      onPress={() => onChange(shiftDateKey(selectedDate, -1))}
      style={{ width: 36, height: 34, borderRadius: 12, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.45 : 1 }}>
      <Text style={{ color: C.accent, fontSize: 24, fontWeight: '700', lineHeight: 27 }}>‹</Text>
    </TouchableOpacity>
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '900' }}>{formatDateLabel(selectedDate)}</Text>
      <Text style={{ color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 3 }}>{isToday ? 'TODAY' : 'HISTORY'}</Text>
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next day" disabled={disabled || isToday}
      onPress={() => onChange(shiftDateKey(selectedDate, 1))}
      style={{ width: 36, height: 34, borderRadius: 12, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center', opacity: disabled || isToday ? 0.35 : 1 }}>
      <Text style={{ color: C.accent, fontSize: 24, fontWeight: '700', lineHeight: 27 }}>›</Text>
    </TouchableOpacity>
    {!isToday && <TouchableOpacity accessibilityRole="button" onPress={() => onChange(localDateKey())}
      style={{ paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, backgroundColor: C.mint }}>
      <Text style={{ color: C.green, fontSize: 10, fontWeight: '900' }}>TODAY</Text>
    </TouchableOpacity>}
  </View>;
}

function TabBar({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const items: { key: Tab; emoji: string; label: string }[] = [
    { key: 'today', emoji: '☀️', label: 'Today' },
    { key: 'food', emoji: '🍓', label: 'Food' },
    { key: 'move', emoji: '🧘', label: 'Move' },
    { key: 'progress', emoji: '🌷', label: 'Progress' },
  ];
  return <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, paddingBottom: 5, paddingHorizontal: 9 }}>
    {items.map(item => {
      const active = selected === item.key;
      return <TouchableOpacity key={item.key} onPress={() => onSelect(item.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 16, backgroundColor: active ? C.lilac : 'transparent' }}>
        <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
        <Text style={{ color: active ? C.accent : C.muted, fontSize: 10, fontWeight: active ? '900' : '700', marginTop: 3, letterSpacing: 0.3 }}>{item.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

function TodayScreen({ data, update, goTo, selectedDate, onDateChange }: { data: FitlogData; update: UpdateData; goTo: (tab: Tab) => void; selectedDate: string; onDateChange: (date: string) => void }) {
  const date = selectedDate;
  const food = data.food.filter(item => item.date === date);
  const workouts = data.workouts.filter(item => item.date === date);
  const water = data.waterByDate[date] || 0;
  const activity = data.activityByDate?.[date];
  const latestWeightKg = data.weights.filter(item => item.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.kg ?? data.profile.weightKg;
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date + 'T12:00:00');
    day.setDate(day.getDate() - 6 + index);
    return {
      date: localDateKey(day),
      label: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(day).slice(0, 1),
      steps: data.activityByDate?.[localDateKey(day)]?.steps ?? null,
    };
  });
  const trackedWeekDays = weekDays.filter(day => day.steps != null);
  const weekAverage = trackedWeekDays.length > 0
    ? Math.round(trackedWeekDays.reduce((sum, day) => sum + (day.steps ?? 0), 0) / trackedWeekDays.length)
    : null;
  const maxWeekSteps = Math.max(1, ...weekDays.map(day => day.steps ?? 0));
  const [stepCount, setStepCount] = useState<number | null>(activity?.steps ?? null);
  const activeEnergy = calculateActiveEnergy({
    steps: stepCount ?? activity?.steps ?? null,
    activity,
    workouts,
    weightKg: latestWeightKg,
    heightCm: data.profile.heightCm,
    age: data.profile.age,
    needsReview: data.assessment.needsReview,
  });
  const [motionStatus, setMotionStatus] = useState<'checking' | 'needs-permission' | 'enabled' | 'denied' | 'unavailable' | 'error'>('checking');
  const [motionMessage, setMotionMessage] = useState('');
  const [activeCaloriesInput, setActiveCaloriesInput] = useState(activity?.activeCalories != null ? String(activity.activeCalories) : '');
  const [activitySaved, setActivitySaved] = useState(false);
  const [manualCaloriesExpanded, setManualCaloriesExpanded] = useState(false);
  const lastPersistedSteps = useRef(activity?.steps ?? -1);

  useEffect(() => {
    let mounted = true;
    Promise.all([Pedometer.isAvailableAsync(), Pedometer.getPermissionsAsync()])
      .then(([available, permission]) => {
        if (!mounted) return;
        if (!available) {
          setMotionStatus('unavailable');
          setMotionMessage('This device does not expose a pedometer. You can still log workouts manually.');
        } else if (permission.granted) {
          setMotionStatus('enabled');
          setMotionMessage('iPhone step tracking is enabled. Totals refresh when Fitlog is open.');
        } else if (permission.canAskAgain) {
          setMotionStatus('needs-permission');
          setMotionMessage('Allow Motion & Fitness access to count steps from this iPhone.');
        } else {
          setMotionStatus('denied');
          setMotionMessage('Motion access is off. Open iPhone Settings → Privacy & Security → Motion & Fitness and allow Fitlog.');
        }
      })
      .catch(error => {
        if (!mounted) return;
        setMotionStatus('error');
        setMotionMessage(error instanceof Error ? error.message : 'Could not check the iPhone pedometer.');
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (motionStatus !== 'enabled') return;
    let mounted = true;
    let subscription: { remove: () => void } | null = null;
    let baseSteps = 0;
    let refreshInFlight = false;

    const persistSteps = (count: number) => {
      if (!mounted) return;
      setStepCount(count);
      if (Math.abs(count - lastPersistedSteps.current) < 10 && count !== 0) return;
      lastPersistedSteps.current = count;
      update(current => {
        const previous = current.activityByDate?.[date];
        if (previous?.steps === count && previous?.source === 'pedometer') return current;
        return {
          ...current,
          activityByDate: {
            ...(current.activityByDate ?? {}),
            [date]: {
              ...previous,
              date,
              steps: count,
              activeCalories: previous?.activeCalories,
              source: previous?.source === 'cmpedometer' ? 'cmpedometer' : 'pedometer',
            },
          },
        };
      });
    };

    const refreshToday = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      subscription?.remove();
      subscription = null;
      try {
        const now = new Date();
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const isSelectedToday = date === localDateKey();
        const queryEnd = isSelectedToday ? now : endOfDay;
        const [result, previousDays] = await Promise.all([
          Pedometer.getStepCountAsync(startOfDay, queryEnd),
          Promise.all(Array.from({ length: 6 }, async (_, index) => {
            const dayStart = new Date(startOfDay);
            dayStart.setDate(dayStart.getDate() - (6 - index));
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            try {
              const dayResult = await Pedometer.getStepCountAsync(dayStart, dayEnd);
              return { date: localDateKey(dayStart), steps: dayResult.steps };
            } catch {
              return null;
            }
          })),
        ]);
        if (!mounted) return;
        update(current => {
          const activityByDate = { ...(current.activityByDate ?? {}) };
          for (const day of previousDays) {
            if (!day) continue;
            const previous = activityByDate[day.date];
            activityByDate[day.date] = {
              date: day.date,
              steps: day.steps,
              activeCalories: previous?.activeCalories,
              source: 'pedometer',
            };
          }
          return { ...current, activityByDate };
        });
        baseSteps = result.steps;
        persistSteps(baseSteps);
        if (isSelectedToday) {
          subscription = Pedometer.watchStepCount(result => {
            persistSteps(baseSteps + result.steps);
          });
        }
      } catch (error) {
        if (mounted) setMotionMessage(error instanceof Error ? error.message : 'Could not read steps for this date.');
      } finally {
        refreshInFlight = false;
      }
    };

    void refreshToday();
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') void refreshToday();
    });
    return () => {
      mounted = false;
      subscription?.remove();
      appStateSubscription.remove();
    };
  }, [motionStatus, date, update]);

  useEffect(() => {
    setActiveCaloriesInput(activity?.activeCalories != null ? String(activity.activeCalories) : '');
    setActivitySaved(false);
  }, [date, activity?.activeCalories]);

  useEffect(() => {
    setStepCount(activity?.steps ?? null);
    lastPersistedSteps.current = activity?.steps ?? -1;
    setManualCaloriesExpanded(false);
  }, [date]);

  const enableStepTracking = async () => {
    setMotionStatus('checking');
    setMotionMessage('');
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        setMotionStatus('unavailable');
        setMotionMessage('This device does not expose a pedometer.');
        return;
      }
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        setMotionStatus('denied');
        setMotionMessage('Motion access was not granted. You can enable it later in iPhone Settings → Privacy & Security → Motion & Fitness.');
        return;
      }
      setMotionStatus('enabled');
      setMotionMessage('Step tracking is on. Carry your iPhone with you; Fitlog refreshes totals when it is open.');
    } catch (error) {
      setMotionStatus('error');
      setMotionMessage(error instanceof Error ? error.message : 'Could not enable step tracking.');
    }
  };

  const saveDailyMovement = () => {
    const activeCalories = activeCaloriesInput.trim() === '' ? undefined : Number(activeCaloriesInput);
    if (activeCalories === undefined) {
      Alert.alert('Add active calories', 'Enter active calories only when you have a trusted value from another device or source.');
      return;
    }
    if (!Number.isFinite(activeCalories) || activeCalories < 0 || activeCalories > 5000) {
      Alert.alert('Check those numbers', 'Active calories must be between 0 and 5,000 kcal.');
      return;
    }
    update(current => {
      const previous = current.activityByDate?.[date];
      return {
        ...current,
        activityByDate: {
          ...(current.activityByDate ?? {}),
          [date]: {
            ...previous,
            date,
            steps: previous?.steps ?? stepCount ?? undefined,
            activeCalories,
            source: previous?.source === 'cmpedometer'
              ? 'cmpedometer'
              : previous?.source === 'pedometer' ? 'pedometer' : 'manual',
          },
        },
      };
    });
    setActivitySaved(true);
  };
  const totals = food.reduce((sum, item) => ({
    calories: sum.calories + item.calories,
    protein: sum.protein + item.protein,
    carbs: sum.carbs + item.carbs,
    fat: sum.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const target = data.assessment.targetCalories;
  const macros = data.assessment.macros;
  const greeting = date === localDateKey() ? (new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening') : 'Looking back';
  const addWater = (amount: number) => update(current => ({ ...current, waterByDate: { ...current.waterByDate, [date]: (current.waterByDate[date] || 0) + amount } }));

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 28 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
      <View>
        <Eyebrow>FITLOG  ✳  YOUR LITTLE WELLNESS SPACE</Eyebrow>
        <Text style={{ color: C.text, fontSize: 28, fontWeight: '900', marginTop: 8 }}>{greeting} ☁️</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{date === localDateKey() ? 'Your daily snapshot' : 'Reviewing a past day'}</Text>
      </View>
      <View style={{ backgroundColor: C.mint, width: 49, height: 49, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 23 }}>🌼</Text>
      </View>
    </View>

    <DateNavigator selectedDate={selectedDate} onChange={onDateChange} />

    <Card style={{ backgroundColor: '#F2ECFB', borderColor: '#E6DDF4' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>IPHONE MOTION ENGINE  ✳  CORE MOTION</Eyebrow>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 5 }}>Your phone counts your steps 👟</Text>
          <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>{motionMessage || 'Checking the iPhone pedometer…'}</Text>
        </View>
        <Text style={{ fontSize: 25, marginLeft: 8 }}>✳</Text>
      </View>
      <View style={{ marginTop: 13 }}>
        {motionStatus === 'enabled'
          ? <ActionButton label="STEP TRACKING IS ON ✓" disabled onPress={() => {}} tone="soft" />
          : motionStatus === 'denied'
            ? <ActionButton label="HOW TO ENABLE MOTION ACCESS" onPress={() => Alert.alert('Enable Motion & Fitness', 'Open iPhone Settings → Privacy & Security → Motion & Fitness, then allow Fitlog.')} tone="soft" />
            : motionStatus === 'unavailable'
              ? <ActionButton label="PEDOMETER UNAVAILABLE" disabled onPress={() => {}} tone="soft" />
              : <ActionButton label={motionStatus === 'checking' ? 'CHECKING MOTION ACCESS…' : 'ENABLE IPHONE STEP TRACKING'} onPress={enableStepTracking} disabled={motionStatus === 'checking'} tone="soft" />}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 9 }}>Uses the iPhone’s built-in pedometer—no Apple Health connection required. iOS keeps up to seven days of step history. Live updates pause in the background and refresh when you return to Fitlog.</Text>
    </Card>

    <Card style={{ backgroundColor: '#FFFCFA' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Eyebrow>DAILY MOVEMENT</Eyebrow>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 5 }}>Your steps & energy 👟</Text>
        </View>
        <Text style={{ fontSize: 23 }}>🔥</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 13 }}>
        <View style={{ flex: 1, backgroundColor: C.mint, padding: 13, borderRadius: 16 }}>
          <Text style={{ color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }}>STEPS WALKED</Text>
          <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{stepCount != null ? stepCount.toLocaleString('en-IN') : activity?.steps != null ? activity.steps.toLocaleString('en-IN') : '—'}</Text>
          <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>steps today</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.peach, padding: 13, borderRadius: 16 }}>
          <Text style={{ color: C.rose, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }}>ACTIVE CALORIES</Text>
          <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{activeEnergy.calories != null ? (activeEnergy.isReported ? '' : '~') + Math.round(activeEnergy.calories).toLocaleString('en-IN') : '—'}</Text>
          <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>{activeEnergy.isReported ? 'kcal reported active' : activeEnergy.calories != null ? 'kcal estimated active' : 'kcal unavailable'}</Text>
        </View>
      </View>
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>LAST 7 DAYS</Eyebrow>
          <Text style={{ color: C.muted, fontSize: 9 }}>{weekAverage != null ? 'Avg ' + weekAverage.toLocaleString('en-IN') + ' / tracked day' : 'Building your history'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 76, gap: 7, marginTop: 8 }}>
          {weekDays.map(day => <View key={day.date} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Text style={{ color: C.muted, fontSize: 8, marginBottom: 4 }}>{day.steps != null ? (day.steps >= 1000 ? (day.steps / 1000).toFixed(1) + 'k' : String(day.steps)) : '—'}</Text>
            <View style={{ width: '72%', height: day.steps != null ? Math.max(4, (day.steps / maxWeekSteps) * 42) : 3, backgroundColor: day.steps != null ? C.accent : C.line, borderRadius: 7 }} />
            <Text style={{ color: C.muted, fontSize: 9, marginTop: 5 }}>{day.label}</Text>
          </View>)}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }}>OPTIONAL MANUAL VALUE</Text>
        <TouchableOpacity onPress={() => setManualCaloriesExpanded(value => !value)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: C.lilac }}>
          <Text style={{ color: C.accent, fontSize: 10, fontWeight: '900' }}>{manualCaloriesExpanded ? 'HIDE' : activity?.activeCalories != null ? 'MANUAL · EDIT' : '+ MANUAL'}</Text>
        </TouchableOpacity>
      </View>
      {manualCaloriesExpanded && <>
        <View style={{ marginTop: 9 }}>
          <TextField label="Active calories from a trusted source" value={activeCaloriesInput} onChange={value => { setActiveCaloriesInput(value); setActivitySaved(false); }} placeholder="Only enter a trusted value" keyboardType="decimal-pad" suffix="kcal" />
        </View>
        <ActionButton label={activitySaved ? 'ACTIVE CALORIES SAVED ✓' : 'SAVE ACTIVE CALORIES'} onPress={saveDailyMovement} tone="soft" />
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 9 }}>Fitlog estimates active calories from steps and logged sessions. A trusted full-day value entered here overrides that estimate.</Text>
      </>}
    </Card>

    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Card style={{ flex: 1, backgroundColor: C.mint, borderColor: '#D5E8DC' }}>
        <Text style={{ fontSize: 21 }}>💧</Text>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{water}<Text style={{ fontSize: 11 }}> ml</Text></Text>
        <Text style={{ color: C.green, fontSize: 10, fontWeight: '800', marginTop: 2 }}>WATER LOGGED</Text>
        <TouchableOpacity onPress={() => addWater(250)} style={{ marginTop: 12, backgroundColor: '#FFFFFF', padding: 9, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>+ 250 ml</Text>
        </TouchableOpacity>
      </Card>
      <Card style={{ flex: 1, backgroundColor: C.peach, borderColor: '#F2DED5' }}>
        <Text style={{ fontSize: 21 }}>🏃‍♀️</Text>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{workouts.length}</Text>
        <Text style={{ color: C.rose, fontSize: 10, fontWeight: '800', marginTop: 2 }}>WORKOUTS TODAY</Text>
        <TouchableOpacity onPress={() => goTo('move')} style={{ marginTop: 12, backgroundColor: '#FFFFFF', padding: 9, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: C.rose, fontSize: 11, fontWeight: '900' }}>Log movement</Text>
        </TouchableOpacity>
      </Card>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7, marginBottom: 9 }}>
      <Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>A little nourishment</Text>
      <TouchableOpacity onPress={() => goTo('food')}><Text style={{ color: C.accent, fontWeight: '900', fontSize: 11 }}>ADD FOOD +</Text></TouchableOpacity>
    </View>
    <Card>
      {food.length === 0 ? <EmptyState emoji="🍑" title="Your food diary is waiting" subtitle="Add your first meal or snack. Small logs make useful patterns over time." /> :
        food.slice().reverse().slice(0, 4).map(item => <FoodRow key={item.id} item={item} />)}
    </Card>
    <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 1, textAlign: 'center' }}>Gentle reminder: these are estimates, not rules. Eat enough, enjoy your food and listen to your body. 🌷</Text>
  </ScrollView>;
}

function FoodRow({ item }: { item: FoodEntry }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
    <View style={{ width: 37, height: 37, borderRadius: 13, backgroundColor: C.peach, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}>
      <Text style={{ fontSize: 17 }}>{item.meal === 'Breakfast' ? '🍳' : item.meal === 'Lunch' ? '🥗' : item.meal === 'Dinner' ? '🍲' : '🍓'}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: 13 }}>{item.name}</Text>
      <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.meal} · P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
      <Text style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{item.estimateSource === 'manual_correction' ? 'Manually corrected' : item.estimateSource === 'ai_photo' ? 'AI photo estimate · reviewed' : item.estimateSource === 'ai_text' ? 'AI text estimate · reviewed' : item.estimateMethod === 'catalogue' ? 'Calculated from food catalogue' : item.estimateMethod === 'manual' ? 'Manual estimate' : 'Saved entry'}</Text>
    </View>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 13 }}>{item.calories} kcal</Text>
  </View>;
}

type DraftFood = { food: NutritionFood; amount: number; unit: NutritionUnit; estimate: FoodEstimate };

function FoodScreen({ data, update, selectedDate, onDateChange }: { data: FitlogData; update: UpdateData; selectedDate: string; onDateChange: (date: string) => void }) {
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<MealType>('Breakfast');
  const [selectedFood, setSelectedFood] = useState<NutritionFood | null>(null);
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<NutritionUnit>('serving');
  const [draft, setDraft] = useState<DraftFood[]>([]);
  const [mealCaloriesOverride, setMealCaloriesOverride] = useState('');
  const [mealProteinOverride, setMealProteinOverride] = useState('');
  const [mealCarbsOverride, setMealCarbsOverride] = useState('');
  const [mealFatOverride, setMealFatOverride] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const date = selectedDate;
  const todaysFood = data.food.filter(item => item.date === date);
  const totals = todaysFood.reduce((sum, item) => ({
    kcal: sum.kcal + item.calories,
    p: sum.p + item.protein,
    c: sum.c + item.carbs,
    f: sum.f + item.fat,
  }), { kcal: 0, p: 0, c: 0, f: 0 });
  const suggestions = useMemo(() => searchFoods(query), [query]);
  const quantity = Number(amount);
  const selectedEstimate = selectedFood && Number.isFinite(quantity) && quantity > 0
    ? estimateFood(selectedFood, quantity, unit)
    : null;
  const draftTotals = draft.reduce((sum, item) => ({
    kcal: sum.kcal + item.estimate.calories,
    p: sum.p + item.estimate.protein,
    c: sum.c + item.estimate.carbs,
    f: sum.f + item.estimate.fat,
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  const chooseFood = (food: NutritionFood) => {
    const suggested = suggestAmount(query, food);
    setSelectedFood(food);
    setAmount(String(suggested.amount));
    setUnit(suggested.unit);
  };

  const addIngredient = () => {
    if (!selectedFood || !selectedEstimate) {
      Alert.alert('Choose a food and portion', 'Select a food and enter a portion greater than zero.');
      return;
    }
    setDraft(current => [...current, {
      food: selectedFood,
      amount: quantity,
      unit,
      estimate: selectedEstimate,
    }]);
    setSelectedFood(null);
    setQuery('');
    setAmount('1');
    setUnit('serving');
  };

  const saveMeal = () => {
    if (draft.length === 0) {
      Alert.alert('Your meal is empty', 'Search for a food and add it to your meal first.');
      return;
    }
    const overrideValues = [mealCaloriesOverride, mealProteinOverride, mealCarbsOverride, mealFatOverride];
    const parsedOverrides = overrideValues.map(value => value.trim() === '' ? null : Number(value));
    if (parsedOverrides.some(value => value != null && (!Number.isFinite(value) || value < 0))) {
      Alert.alert('Check your meal totals', 'Nutrition overrides must be valid non-negative numbers. Leave a field blank to use the ingredient estimate.');
      return;
    }
    const hasManualOverride = parsedOverrides.some(value => value != null);
    const finalCalories = parsedOverrides[0] ?? draftTotals.kcal;
    const finalProtein = parsedOverrides[1] ?? draftTotals.p;
    const finalCarbs = parsedOverrides[2] ?? draftTotals.c;
    const finalFat = parsedOverrides[3] ?? draftTotals.f;
    const entry: FoodEntry = {
      id: makeId(),
      date,
      name: draft.map(item => item.food.name).join(' + '),
      meal,
      calories: Math.round(finalCalories),
      protein: Math.round(finalProtein * 10) / 10,
      carbs: Math.round(finalCarbs * 10) / 10,
      fat: Math.round(finalFat * 10) / 10,
      createdAt: Date.now(),
      estimateMethod: hasManualOverride ? 'manual' : 'catalogue',
      estimateSource: hasManualOverride ? 'manual_correction' : 'catalogue',
      ingredients: draft.map(item => ({
        foodId: item.food.id,
        name: item.food.name,
        grams: item.estimate.grams,
        calories: item.estimate.calories,
        protein: item.estimate.protein,
        carbs: item.estimate.carbs,
        fat: item.estimate.fat,
      })),
    };
    update(current => ({ ...current, food: [...current.food, entry] }));
    setDraft([]);
    setMealCaloriesOverride('');
    setMealProteinOverride('');
    setMealCarbsOverride('');
    setMealFatOverride('');
    setSelectedFood(null);
    setQuery('');
    Alert.alert('Meal saved 🌷', 'Fitlog added the estimated calories and macros to ' + formatDateLabel(date) + '’s diary.');
  };

  const saveCustomFood = () => {
    const kcal = Number(customCalories);
    const macros = [customProtein, customCarbs, customFat].map(value => value.trim() === '' ? 0 : Number(value));
    if (!customName.trim() || !Number.isFinite(kcal) || kcal < 0 ||
        macros.some(value => !Number.isFinite(value) || value < 0)) {
      Alert.alert('Check the custom food', 'Enter a food name and valid non-negative calorie and macro values.');
      return;
    }
    const entry: FoodEntry = {
      id: makeId(), date, name: customName.trim(), meal,
      calories: kcal,
      protein: macros[0],
      carbs: macros[1],
      fat: macros[2],
      createdAt: Date.now(),
      estimateMethod: 'manual',
      estimateSource: 'manual',
    };
    update(current => ({ ...current, food: [...current.food, entry] }));
    setCustomName(''); setCustomCalories(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
    setCustomMode(false); setQuery('');
    Alert.alert('Custom entry saved', 'Your manually entered nutrition values were added to the diary.');
  };

  const removeFood = (id: string) => Alert.alert('Remove this entry?', 'This only removes the selected food log.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => update(current => ({ ...current, food: current.food.filter(item => item.id !== id) })) },
  ]);

  const beginEditFood = (item: FoodEntry) => {
    setEditingFoodId(item.id);
    setEditFoodName(item.name);
    setEditCalories(String(item.calories));
    setEditProtein(String(item.protein));
    setEditCarbs(String(item.carbs));
    setEditFat(String(item.fat));
  };

  const cancelEditFood = () => setEditingFoodId(null);

  const saveEditedFood = () => {
    const calories = Number(editCalories);
    const protein = Number(editProtein);
    const carbs = Number(editCarbs);
    const fat = Number(editFat);
    const values = [calories, protein, carbs, fat];
    if (!editFoodName.trim() || values.some(value => !Number.isFinite(value) || value < 0)) {
      Alert.alert('Check your nutrition values', 'Enter a food name and non-negative calorie and macro values.');
      return;
    }
    update(current => ({
      ...current,
      food: current.food.map(item => item.id === editingFoodId ? {
        ...item,
        name: editFoodName.trim(),
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        estimateMethod: 'manual',
        estimateSource: 'manual_correction',
      } : item),
    }));
    setEditingFoodId(null);
    Alert.alert('Entry updated', 'Your corrected nutrition values are saved in the diary.');
  };

  return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="FOOD JOURNAL  ✳  ONE BITE AT A TIME" title="Nourish yourself 🍓" subtitle="Search a food, choose the portion and Fitlog calculates the estimated nutrition for you." />
    <DateNavigator selectedDate={selectedDate} onChange={onDateChange} />
    <Card style={{ backgroundColor: C.lilac }}>
      <Eyebrow>{date === localDateKey() ? "TODAY'S TOTAL" : 'DAY TOTAL'}</Eyebrow>
      <Text style={{ color: C.text, fontSize: 31, fontWeight: '900', marginTop: 8 }}>{Math.round(totals.kcal)} <Text style={{ fontSize: 13, color: C.muted }}>kcal logged</Text></Text>
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>Protein {Math.round(totals.p)}g  ·  Carbs {Math.round(totals.c)}g  ·  Fat {Math.round(totals.f)}g</Text>
    </Card>
    <Card>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 14 }}>Build your meal ✨</Text>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 9 }}>WHAT ARE YOU LOGGING?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map(option => <Chip key={option} label={option} selected={meal === option} onPress={() => setMeal(option)} />)}
      </View>

      <TextField label="Search food or dish" value={query} onChange={value => { setQuery(value); setSelectedFood(null); }} placeholder="e.g. coffee, chicken 65, idli, rice" />
      {!selectedFood && <View style={{ marginTop: 1, marginBottom: 10 }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>{query.trim() ? 'MATCHING FOODS' : 'POPULAR STARTERS'}</Text>
        {suggestions.length === 0 ? <View style={{ padding: 13, borderRadius: 14, backgroundColor: '#FFFCFA' }}>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>No match in the starter catalogue yet. Try a simpler food name or add the ingredients separately.</Text>
        </View> : suggestions.slice(0, 6).map(food => <TouchableOpacity key={food.id} onPress={() => chooseFood(food)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: '#FFFCFA', marginBottom: 7 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{food.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{food.category} · {food.servingLabel}</Text>
          </View>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 12 }}>{Math.round(food.kcal * food.servingGrams / 100)} kcal</Text>
          <Text style={{ color: C.accent, fontSize: 20, marginLeft: 10 }}>＋</Text>
        </TouchableOpacity>)}
        <TouchableOpacity onPress={() => { setCustomName(query.trim()); setCustomMode(value => !value); }} style={{ paddingVertical: 10, alignSelf: 'flex-start' }}>
          <Text style={{ color: C.accent, fontSize: 11, fontWeight: '900' }}>{customMode ? 'CLOSE CUSTOM ENTRY' : 'CAN’T FIND YOUR FOOD? ADD CUSTOM VALUES'}</Text>
        </TouchableOpacity>
      </View>}
      {customMode && <View style={{ backgroundColor: C.butter, borderRadius: 17, borderWidth: 1, borderColor: '#F0E5CA', padding: 14, marginBottom: 13 }}>
        <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>Custom food or recipe</Text>
        <TextField label="Food name" value={customName} onChange={setCustomName} placeholder="e.g. Homemade chicken curry" />
        <TextField label="Calories" value={customCalories} onChange={setCustomCalories} placeholder="Only for unlisted foods" keyboardType="decimal-pad" suffix="kcal" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><TextField label="Protein" value={customProtein} onChange={setCustomProtein} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
          <View style={{ flex: 1 }}><TextField label="Carbs" value={customCarbs} onChange={setCustomCarbs} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
          <View style={{ flex: 1 }}><TextField label="Fat" value={customFat} onChange={setCustomFat} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
        </View>
        <ActionButton label="SAVE CUSTOM ENTRY" onPress={saveCustomFood} />
      </View>}

      {selectedFood && <View style={{ backgroundColor: '#F7F2FC', borderWidth: 1, borderColor: '#E4D9F2', borderRadius: 18, padding: 15, marginTop: 4, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 15 }}>{selectedFood.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{selectedFood.category} · estimated values</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedFood(null)}><Text style={{ color: C.accent, fontWeight: '900', padding: 6 }}>CHANGE</Text></TouchableOpacity>
        </View>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 16, marginBottom: 8 }}>PORTION SIZE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 9 }}>
          <Chip label={selectedFood.servingLabel} selected={unit === 'serving'} onPress={() => setUnit('serving')} />
          <Chip label="Grams" selected={unit === 'g'} onPress={() => setUnit('g')} />
        </View>
        <TextField label={unit === 'serving' ? 'Number of servings' : 'Weight'} value={amount} onChange={setAmount} placeholder="1" keyboardType="decimal-pad" suffix={unit === 'serving' ? 'servings' : 'g'} />
        {selectedEstimate && <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 13, marginTop: 1 }}>
          <Text style={{ color: C.accent, fontSize: 24, fontWeight: '900' }}>{selectedEstimate.calories} kcal</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>{selectedEstimate.grams} g  ·  Protein {selectedEstimate.protein}g  ·  Carbs {selectedEstimate.carbs}g  ·  Fat {selectedEstimate.fat}g</Text>
        </View>}
        <View style={{ marginTop: 12 }}><ActionButton label="ADD THIS FOOD TO MEAL  +" onPress={addIngredient} disabled={!selectedEstimate} /></View>
      </View>}

      {draft.length > 0 && <View style={{ backgroundColor: '#FFFCFA', borderRadius: 17, padding: 14, marginTop: 5 }}>
        <Text style={{ color: C.text, fontSize: 13, fontWeight: '900', marginBottom: 8 }}>In this meal · {draft.length} item{draft.length === 1 ? '' : 's'}</Text>
        {draft.map((item, index) => <View key={item.food.id + '-' + index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 12 }}>{item.food.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.estimate.grams} g · {item.estimate.calories} kcal</Text>
          </View>
          <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>{item.estimate.protein}g P</Text>
          <TouchableOpacity onPress={() => {
            setSelectedFood(item.food);
            setQuery(item.food.name);
            setAmount(String(item.estimate.grams));
            setUnit('g');
            setDraft(current => current.filter((_, i) => i !== index));
          }} style={{ marginLeft: 8, padding: 5 }}><Text style={{ color: C.accent, fontSize: 9, fontWeight: '900' }}>EDIT</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setDraft(current => current.filter((_, i) => i !== index))} style={{ marginLeft: 5, padding: 5 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>
        </View>)}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 }}>
          <View>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>MEAL ESTIMATE</Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 3 }}>{draftTotals.kcal} kcal</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>P {draftTotals.p.toFixed(1)}g · C {draftTotals.c.toFixed(1)}g · F {draftTotals.f.toFixed(1)}g</Text>
          </View>
          <TouchableOpacity onPress={() => { setDraft([]); setMealCaloriesOverride(''); setMealProteinOverride(''); setMealCarbsOverride(''); setMealFatOverride(''); }}><Text style={{ color: '#B27D87', fontSize: 10, fontWeight: '900' }}>CLEAR</Text></TouchableOpacity>
        </View>
        <View style={{ marginTop: 13 }}>
          <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginBottom: 9 }}>Optional: correct the final meal total if your recipe, oil or portion differs from the catalogue. Leave blank to keep the ingredient estimate.</Text>
          <TextField label="Meal calories" value={mealCaloriesOverride} onChange={setMealCaloriesOverride} placeholder={String(draftTotals.kcal)} keyboardType="decimal-pad" suffix="kcal" />
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <View style={{ flex: 1 }}><TextField label="Protein" value={mealProteinOverride} onChange={setMealProteinOverride} placeholder={draftTotals.p.toFixed(1)} keyboardType="decimal-pad" suffix="g" /></View>
            <View style={{ flex: 1 }}><TextField label="Carbs" value={mealCarbsOverride} onChange={setMealCarbsOverride} placeholder={draftTotals.c.toFixed(1)} keyboardType="decimal-pad" suffix="g" /></View>
            <View style={{ flex: 1 }}><TextField label="Fat" value={mealFatOverride} onChange={setMealFatOverride} placeholder={draftTotals.f.toFixed(1)} keyboardType="decimal-pad" suffix="g" /></View>
          </View>
          <ActionButton label="SAVE MEAL TO DIARY  ✓" onPress={saveMeal} />
        </View>
      </View>}
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 14 }}>Estimates use typical values per 100 g and standard household portions. Oil, recipe, brand and cooking method can change the real numbers.</Text>
    </Card>

    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginBottom: 10 }}>{date === localDateKey() ? "Today's diary" : 'Diary · ' + formatDateLabel(date)}</Text>
    <Card>
      {todaysFood.length === 0 ? <EmptyState emoji="🥣" title="Nothing logged yet" subtitle="Your saved meals will appear here." /> :
        todaysFood.slice().reverse().map(item => <View key={item.id}>
          <FoodRow item={item} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 15, paddingVertical: 5 }}>
            <TouchableOpacity onPress={() => editingFoodId === item.id ? cancelEditFood() : beginEditFood(item)}>
              <Text style={{ color: C.accent, fontWeight: '900', fontSize: 10 }}>{editingFoodId === item.id ? 'CLOSE EDITOR' : 'EDIT'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFood(item.id)}><Text style={{ color: '#B27D87', fontWeight: '800', fontSize: 10 }}>REMOVE</Text></TouchableOpacity>
          </View>
          {editingFoodId === item.id && <View style={{ backgroundColor: '#F7F2FC', borderRadius: 16, borderWidth: 1, borderColor: '#E4D9F2', padding: 13, marginBottom: 10 }}>
            <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>Correct this food log</Text>
            <TextField label="Food / meal name" value={editFoodName} onChange={setEditFoodName} placeholder="Food name" />
            <TextField label="Calories" value={editCalories} onChange={setEditCalories} placeholder="kcal" keyboardType="decimal-pad" suffix="kcal" />
            <View style={{ flexDirection: 'row', gap: 7 }}>
              <View style={{ flex: 1 }}><TextField label="Protein" value={editProtein} onChange={setEditProtein} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
              <View style={{ flex: 1 }}><TextField label="Carbs" value={editCarbs} onChange={setEditCarbs} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
              <View style={{ flex: 1 }}><TextField label="Fat" value={editFat} onChange={setEditFat} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
            </View>
            <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginBottom: 11 }}>Edits are saved as your manual correction. Use the ingredient editor above to change individual portions before saving a new meal.</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><ActionButton label="SAVE CORRECTION" onPress={saveEditedFood} /></View>
              <View style={{ flex: 1 }}><ActionButton label="CANCEL" onPress={cancelEditFood} tone="outline" /></View>
            </View>
          </View>}
        </View>)}
    </Card>
    <Card style={{ backgroundColor: C.butter, borderColor: '#F0E5CA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>📷 AI food scan · coming next</Text>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>AI photo and free-text estimates are not connected yet. Fitlog will only add them after a secure backend is configured, and every result will open as an editable draft for you to review before saving.</Text>
    </Card>
  </ScrollView>;
}
function MoveScreen({ data, update, isActive, selectedDate, onDateChange }: { data: FitlogData; update: UpdateData; isActive: boolean; selectedDate: string; onDateChange: (date: string) => void }) {
  const date = selectedDate;
  const isSelectedToday = date === localDateKey();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Walk');
  const [minutes, setMinutes] = useState('');
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [motionStats, setMotionStats] = useState({ samples: 0, rms: 0 });
  const [motionSessionMessage, setMotionSessionMessage] = useState('');
  const [dailySteps, setDailySteps] = useState<number | null>(data.activityByDate?.[date]?.steps ?? null);
  const [dailyPedometerStatus, setDailyPedometerStatus] = useState<'checking' | 'ready' | 'needs-permission' | 'denied' | 'unavailable' | 'error'>('checking');
  const [dailyMotionCapabilities, setDailyMotionCapabilities] = useState<NativeMotionCapabilities | null>(null);
  const [stepRefreshKey, setStepRefreshKey] = useState(0);
  const lastPersistedDailySteps = useRef(data.activityByDate?.[date]?.steps ?? -1);
  const motionSubscription = useRef<{ remove: () => void } | null>(null);
  const nativePedometerSubscription = useRef<{ remove: () => void } | null>(null);
  const nativePedometerErrorSubscription = useRef<{ remove: () => void } | null>(null);
  const pedometerSubscription = useRef<{ remove: () => void } | null>(null);
  const motionAccumulator = useRef({ samples: 0, sumSquares: 0 });
  const options = ['Strength', 'Pilates', 'Walk', 'Run', 'Cycling', 'Mobility', 'Other'];
  const todays = data.workouts.filter(item => item.date === date);
  const totalMinutes = todays.reduce((sum, item) => sum + item.minutes, 0);

  const latestWeightKg = data.weights.filter(item => item.date <= date).sort((a, b) => b.date.localeCompare(a.date))[0]?.kg ?? data.profile.weightKg;
  const stepLengthMeters = (data.profile.heightCm / 100) * 0.415;
  const todayActivity = data.activityByDate?.[date];
  const estimatedDistanceKm = dailySteps == null ? null : (dailySteps * stepLengthMeters) / 1000;
  const displayedDistanceKm = todayActivity?.distanceMeters != null
    ? todayActivity.distanceMeters / 1000
    : estimatedDistanceKm;
  const distanceDetail = todayActivity?.distanceMeters != null
    ? 'iPhone Core Motion distance estimate'
    : 'Rough stride estimate from steps and height';
  const paceSecondsPerMeter = todayActivity?.currentPaceSecondsPerMeter && todayActivity.currentPaceSecondsPerMeter > 0
    ? todayActivity.currentPaceSecondsPerMeter
    : todayActivity?.averageActivePaceSecondsPerMeter && todayActivity.averageActivePaceSecondsPerMeter > 0
      ? todayActivity.averageActivePaceSecondsPerMeter
      : null;
  const walkingRunningSpeedKmh = paceSecondsPerMeter != null ? 3.6 / paceSecondsPerMeter : null;
  const speedDetail = todayActivity?.currentPaceSecondsPerMeter != null
    ? 'Current iPhone walking/running speed'
    : todayActivity?.averageActivePaceSecondsPerMeter != null
      ? 'Average active speed today'
      : dailyMotionCapabilities?.pace === false
        ? 'Pace unavailable on this iPhone'
        : FitlogMotion ? 'Appears when Core Motion detects walking or running' : 'Native iOS build required';
  const floorsDetail = todayActivity?.floorsAscended != null
    ? 'Apple Core Motion · floors ascended'
    : dailyMotionCapabilities?.floorCounting === false
      ? 'Floor counting unavailable on this iPhone'
      : FitlogMotion ? 'No floors recorded yet today' : 'Native iOS build required';
  const femaleBmr = 10 * latestWeightKg + 6.25 * data.profile.heightCm - 5 * data.profile.age - 161;
  const maleBmr = 10 * latestWeightKg + 6.25 * data.profile.heightCm - 5 * data.profile.age + 5;
  const bmrValues = data.profile.equationSex === 'female' ? [femaleBmr]
    : data.profile.equationSex === 'male' ? [maleBmr] : [femaleBmr, maleBmr];
  const bmrLow = Math.min(...bmrValues);
  const bmrHigh = Math.max(...bmrValues);
  const minutesElapsedToday = isSelectedToday ? new Date().getHours() * 60 + new Date().getMinutes() : 1440;
  const restingEnergyAllowed = data.profile.age >= 18 && !data.assessment.needsReview;
  const restingEnergyLow = Math.round(bmrLow * minutesElapsedToday / 1440);
  const restingEnergyHigh = Math.round(bmrHigh * minutesElapsedToday / 1440);
  const restingEnergyText = !restingEnergyAllowed ? '—'
    : bmrLow === bmrHigh ? '~' + restingEnergyLow.toLocaleString('en-IN') + ' kcal'
      : '~' + restingEnergyLow.toLocaleString('en-IN') + '–' + restingEnergyHigh.toLocaleString('en-IN') + ' kcal';
  const activeEnergy = calculateActiveEnergy({
    steps: dailySteps ?? todayActivity?.steps ?? null,
    activity: todayActivity,
    workouts: todays,
    weightKg: latestWeightKg,
    heightCm: data.profile.heightCm,
    age: data.profile.age,
    needsReview: data.assessment.needsReview,
  });
  const activeEnergyText = activeEnergy.calories != null
    ? (activeEnergy.isReported ? '' : '~') + Math.round(activeEnergy.calories).toLocaleString('en-IN') + ' kcal'
    : '—';
  const activeEnergyDetail = activeEnergy.detail;

  useEffect(() => {
    const savedSteps = data.activityByDate?.[date]?.steps;
    setDailySteps(savedSteps ?? null);
    lastPersistedDailySteps.current = savedSteps ?? -1;
    setDailyMotionCapabilities(null);
    setDailyPedometerStatus('checking');
  }, [date]);

  useEffect(() => {
    if (!isActive) return;
    let mounted = true;
    let subscription: { remove: () => void } | null = null;
    let nativeSubscription: { remove: () => void } | null = null;
    let nativeErrorSubscription: { remove: () => void } | null = null;
    let refreshInFlight = false;
    let baseSteps = 0;

    const persistSteps = (count: number) => {
      if (!mounted) return;
      setDailySteps(count);
      if (Math.abs(count - lastPersistedDailySteps.current) < 10 && count !== 0) return;
      lastPersistedDailySteps.current = count;
      update(current => {
        const previous = current.activityByDate?.[date];
        if (previous?.steps === count && previous?.source === 'pedometer') return current;
        return {
          ...current,
          activityByDate: {
            ...(current.activityByDate ?? {}),
            [date]: { ...previous, date, steps: count, activeCalories: previous?.activeCalories, source: previous?.source === 'cmpedometer' ? 'cmpedometer' : 'pedometer' },
          },
        };
      });
    };

    const persistNativeSnapshot = (snapshot: NativePedometerSnapshot) => {
      if (!mounted) return;
      setDailySteps(snapshot.steps);
      update(current => {
        const previous = current.activityByDate?.[date];
        const next = {
          ...previous,
          date,
          steps: snapshot.steps,
          activeCalories: previous?.activeCalories,
          source: 'cmpedometer' as const,
          distanceMeters: snapshot.distanceMeters ?? null,
          floorsAscended: snapshot.floorsAscended ?? null,
          floorsDescended: snapshot.floorsDescended ?? null,
          currentPaceSecondsPerMeter: snapshot.currentPaceSecondsPerMeter ?? null,
          averageActivePaceSecondsPerMeter: snapshot.averageActivePaceSecondsPerMeter ?? null,
          currentCadenceStepsPerSecond: snapshot.currentCadenceStepsPerSecond ?? null,
        };
        const same = previous?.steps === next.steps &&
          previous?.distanceMeters === next.distanceMeters &&
          previous?.floorsAscended === next.floorsAscended &&
          previous?.floorsDescended === next.floorsDescended &&
          previous?.currentPaceSecondsPerMeter === next.currentPaceSecondsPerMeter &&
          previous?.averageActivePaceSecondsPerMeter === next.averageActivePaceSecondsPerMeter &&
          previous?.currentCadenceStepsPerSecond === next.currentCadenceStepsPerSecond;
        if (same) return current;
        return {
          ...current,
          activityByDate: { ...(current.activityByDate ?? {}), [date]: next },
        };
      });
    };

    const refreshToday = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      subscription?.remove();
      subscription = null;
      nativeSubscription?.remove();
      nativeSubscription = null;
      nativeErrorSubscription?.remove();
      nativeErrorSubscription = null;
      try {
        const now = new Date();
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setMilliseconds(-1);
        const queryEnd = isSelectedToday ? now : endOfDay;

        if (FitlogMotion) {
          FitlogMotion.stopUpdates();
          const capabilities = FitlogMotion.getCapabilities();
          if (!mounted) return;
          setDailyMotionCapabilities(capabilities);
          if (!capabilities.stepCounting) {
            setDailyPedometerStatus('unavailable');
            return;
          }
          if (capabilities.authorizationStatus !== 'authorized') {
            setDailyPedometerStatus(
              capabilities.authorizationStatus === 'denied' || capabilities.authorizationStatus === 'restricted'
                ? 'denied'
                : 'needs-permission'
            );
            return;
          }
          const result = await FitlogMotion.queryPedometerData(startOfDay.getTime(), queryEnd.getTime());
          if (!mounted) return;
          setDailyPedometerStatus('ready');
          persistNativeSnapshot(result);
          if (isSelectedToday) {
            nativeSubscription = FitlogMotion.addListener('onPedometerUpdate', persistNativeSnapshot);
            nativeErrorSubscription = FitlogMotion.addListener('onPedometerError', () => {
              if (mounted) setDailyPedometerStatus('error');
            });
            const started = FitlogMotion.startUpdates(startOfDay.getTime());
            if (!started) setDailyPedometerStatus('unavailable');
          }
          return;
        }

        const [available, permission] = await Promise.all([
          Pedometer.isAvailableAsync(),
          Pedometer.getPermissionsAsync(),
        ]);
        if (!mounted) return;
        if (!available) {
          setDailyPedometerStatus('unavailable');
          return;
        }
        if (!permission.granted) {
          setDailyPedometerStatus(permission.canAskAgain ? 'needs-permission' : 'denied');
          return;
        }
        const result = await Pedometer.getStepCountAsync(startOfDay, queryEnd);
        if (!mounted) return;
        baseSteps = result.steps;
        setDailyPedometerStatus('ready');
        persistSteps(baseSteps);
        if (isSelectedToday) subscription = Pedometer.watchStepCount(result => persistSteps(baseSteps + result.steps));
      } catch {
        if (mounted) {
          if (FitlogMotion) {
            const capabilities = FitlogMotion.getCapabilities();
            setDailyMotionCapabilities(capabilities);
            setDailyPedometerStatus(
              capabilities.authorizationStatus === 'denied' || capabilities.authorizationStatus === 'restricted'
                ? 'denied'
                : 'error'
            );
          } else {
            setDailyPedometerStatus('error');
          }
        }
      } finally {
        refreshInFlight = false;
      }
    };

    void refreshToday();
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') void refreshToday();
    });
    return () => {
      mounted = false;
      subscription?.remove();
      nativeSubscription?.remove();
      nativeErrorSubscription?.remove();
      if (FitlogMotion) FitlogMotion.stopUpdates();
      appStateSubscription.remove();
    };
  }, [isActive, date, update, stepRefreshKey]);

  const requestDailyStepAccess = async () => {
    try {
      setDailyPedometerStatus('checking');
      if (FitlogMotion) {
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const queryEnd = isSelectedToday ? Date.now() : endOfDay.getTime();
        await FitlogMotion.queryPedometerData(startOfDay.getTime(), queryEnd);
        setStepRefreshKey(value => value + 1);
        return;
      }
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        setDailyPedometerStatus('denied');
        return;
      }
      setStepRefreshKey(value => value + 1);
    } catch {
      setDailyPedometerStatus(FitlogMotion ? 'denied' : 'error');
    }
  };

  useEffect(() => {
    if (sessionStartedAt == null) return;
    const interval = setInterval(() => {
      setSessionElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  useEffect(() => () => {
    motionSubscription.current?.remove();
    pedometerSubscription.current?.remove();
  }, []);

  const startMotionSession = async () => {
    if (!isSelectedToday) {
      Alert.alert('Choose today for a live session', 'You can add a manual workout to a past date, but live sensor sessions must be recorded today.');
      return;
    }
    if (sessionStartedAt != null) return;
    try {
      const available = await DeviceMotion.isAvailableAsync();
      if (!available) {
        Alert.alert('Motion sensor unavailable', 'This device cannot provide live motion data. You can still use the manual workout logger.');
        return;
      }
      let motionPermission = await DeviceMotion.getPermissionsAsync();
      if (!motionPermission.granted && motionPermission.canAskAgain) {
        motionPermission = await DeviceMotion.requestPermissionsAsync();
      }
      if (!motionPermission.granted) {
        Alert.alert('Motion access needed', 'Allow Fitlog to access Motion & Fitness in iPhone Settings to record live movement sessions.');
        return;
      }

      let canCountSteps = false;
      try {
        if (await Pedometer.isAvailableAsync()) {
          let permission = await Pedometer.getPermissionsAsync();
          if (!permission.granted && permission.canAskAgain) permission = await Pedometer.requestPermissionsAsync();
          canCountSteps = permission.granted;
        }
      } catch {
        canCountSteps = false;
      }

      motionAccumulator.current = { samples: 0, sumSquares: 0 };
      setMotionStats({ samples: 0, rms: 0 });
      setSessionSteps(0);
      setSessionElapsedSeconds(0);
      setMotionSessionMessage(canCountSteps
        ? 'Live motion and step sampling are running. Keep your phone with you.'
        : 'Motion sampling is running. Step access was unavailable, so this session will not include step counts.');

      DeviceMotion.setUpdateInterval(100);
      motionSubscription.current = DeviceMotion.addListener(({ acceleration }) => {
        if (!acceleration) return;
        const magnitude = Math.sqrt(
          acceleration.x * acceleration.x +
          acceleration.y * acceleration.y +
          acceleration.z * acceleration.z
        );
        const accumulator = motionAccumulator.current;
        accumulator.samples += 1;
        accumulator.sumSquares += magnitude * magnitude;
        if (accumulator.samples % 10 === 0) {
          setMotionStats({
            samples: accumulator.samples,
            rms: Math.sqrt(accumulator.sumSquares / accumulator.samples),
          });
        }
      });

      if (canCountSteps) {
        pedometerSubscription.current = Pedometer.watchStepCount(result => setSessionSteps(result.steps));
      }
      setSessionStartedAt(Date.now());
    } catch (error) {
      motionSubscription.current?.remove();
      pedometerSubscription.current?.remove();
      motionSubscription.current = null;
      pedometerSubscription.current = null;
      Alert.alert('Could not start motion session', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const stopMotionSession = () => {
    if (sessionStartedAt == null) return;
    const endedAt = Date.now();
    const elapsedSeconds = Math.max(1, Math.floor((endedAt - sessionStartedAt) / 1000));
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const accumulator = motionAccumulator.current;
    const rms = accumulator.samples > 0
      ? Math.sqrt(accumulator.sumSquares / accumulator.samples)
      : undefined;
    const cadenceSpm = sessionSteps > 0
      ? Math.round(sessionSteps / (elapsedSeconds / 60))
      : undefined;
    const item: WorkoutEntry = {
      id: makeId(),
      date: localDateKey(new Date(sessionStartedAt)),
      name: name.trim() || category + ' session',
      category,
      minutes: durationMinutes,
      createdAt: sessionStartedAt,
      source: 'motion',
      steps: sessionSteps > 0 ? sessionSteps : undefined,
      cadenceSpm,
      averageMotionMps2: rms != null ? Math.round(rms * 100) / 100 : undefined,
      motionSamples: accumulator.samples,
    };

    motionSubscription.current?.remove();
    pedometerSubscription.current?.remove();
    motionSubscription.current = null;
    pedometerSubscription.current = null;
    update(current => ({ ...current, workouts: [...current.workouts, item] }));
    setSessionStartedAt(null);
    setSessionElapsedSeconds(0);
    setSessionSteps(0);
    setMotionStats({ samples: 0, rms: 0 });
    setMotionSessionMessage('Session saved. Fitlog stores the summary, not the raw motion stream.');
    Alert.alert('Movement session saved 🌱', item.minutes + ' min' + (item.steps != null ? ' · ' + item.steps.toLocaleString('en-IN') + ' steps' : '') + '. A workout-energy estimate will appear in that day’s movement details.');
  };

  const addWorkout = () => {
    const duration = Number(minutes);
    if (!name.trim() || !Number.isFinite(duration) || duration <= 0) {
      Alert.alert('Add your movement', 'Enter an activity and its duration in minutes.');
      return;
    }
    const item: WorkoutEntry = { id: makeId(), date, name: name.trim(), category, minutes: duration, createdAt: Date.now() };
    update(current => ({ ...current, workouts: [...current.workouts, item] }));
    setName(''); setMinutes('');
  };
  const removeWorkout = (id: string) => Alert.alert('Remove workout?', 'This will remove the selected activity log.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => update(current => ({ ...current, workouts: current.workouts.filter(item => item.id !== id) })) },
  ]);

  const timerLabel = String(Math.floor(sessionElapsedSeconds / 60)).padStart(2, '0') + ':' +
    String(sessionElapsedSeconds % 60).padStart(2, '0');

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="MOVEMENT JOURNAL  ✳  YOUR PACE, YOUR WAY" title="Move a little 🌱" subtitle="Use your iPhone’s motion sensors during a session, or add a workout manually." />
    <DateNavigator selectedDate={selectedDate} onChange={onDateChange} disabled={sessionStartedAt != null} />
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Card style={{ flex: 1, backgroundColor: C.mint }}>
        <Text style={{ fontSize: 21 }}>🌼</Text>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '900', marginTop: 7 }}>{todays.length}</Text>
        <Text style={{ color: C.green, fontWeight: '800', fontSize: 10 }}>SESSIONS</Text>
      </Card>
      <Card style={{ flex: 1, backgroundColor: C.peach }}>
        <Text style={{ fontSize: 21 }}>⏱️</Text>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '900', marginTop: 7 }}>{totalMinutes}</Text>
        <Text style={{ color: C.rose, fontWeight: '800', fontSize: 10 }}>MINUTES MOVED</Text>
      </Card>
    </View>
    <Card>
      <Eyebrow>YOUR DAILY ACTIVITY</Eyebrow>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 5, marginBottom: 5 }}>Movement details ✨</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 13 }}>A snapshot of your steps, energy and walking activity for this day.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <MovementMetric emoji="👟" label="STEPS" value={dailySteps == null ? '—' : dailySteps.toLocaleString('en-IN')} detail={dailyPedometerStatus === 'ready' ? (isSelectedToday ? 'iPhone Pedometer · live while open' : 'iPhone Pedometer · historical total') : dailyPedometerStatus === 'needs-permission' ? 'Allow Motion & Fitness access' : dailyPedometerStatus === 'denied' ? 'Enable access in iPhone Settings' : dailyPedometerStatus === 'unavailable' ? 'Pedometer unavailable' : dailyPedometerStatus === 'error' ? 'Could not read steps' : 'Checking iPhone sensor…'} tint={C.mint} />
        <MovementMetric emoji="📍" label="WALK / RUN DISTANCE" value={displayedDistanceKm == null ? '—' : (todayActivity?.distanceMeters != null ? '' : '~') + displayedDistanceKm.toFixed(2) + ' km'} detail={distanceDetail} tint={C.lilac} />
        <MovementMetric emoji="🔥" label="ACTIVE CALORIES" value={activeEnergyText} detail={activeEnergyDetail} tint={C.peach} />
        <MovementMetric emoji="🌙" label="RESTING ENERGY" value={restingEnergyText} detail={restingEnergyAllowed ? (isSelectedToday ? 'BMR estimate, prorated through today' : 'Full-day BMR estimate') : 'Not estimated for this profile'} tint={C.butter} />
        <MovementMetric emoji="🪜" label="STAIRS CLIMBED" value={todayActivity?.floorsAscended != null ? String(todayActivity.floorsAscended) : '—'} detail={floorsDetail} tint="#F1ECF8" />
        <MovementMetric emoji="🏃" label="WALK / RUN SPEED" value={walkingRunningSpeedKmh != null ? walkingRunningSpeedKmh.toFixed(1) + ' km/h' : '—'} detail={speedDetail} tint="#FBEFED" />
      </View>
      {(dailyPedometerStatus === 'needs-permission' || dailyPedometerStatus === 'denied') && <View style={{ marginTop: 2 }}>
        <ActionButton label={dailyPedometerStatus === 'denied' ? 'OPEN IPHONE SETTINGS' : 'ALLOW STEP ACCESS'} onPress={dailyPedometerStatus === 'denied' ? () => { void Linking.openSettings(); } : requestDailyStepAccess} tone="soft" />
      </View>}
      <Text style={{ color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 11 }}>Active calories combine estimated energy from unassigned daily steps and logged sessions, with session steps subtracted to reduce double counting. A full-day value from another trusted source takes precedence. Resting energy is a BMR estimate. Native distance, floors and pace appear when supported by the iPhone; Expo Go shows only the fallback step-distance estimate.</Text>
    </Card>
    <Card>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 15 }}>Choose your movement</Text>
      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 9 }}>WHAT ARE YOU DOING?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map(option => <Chip key={option} label={option} selected={category === option} onPress={() => { if (sessionStartedAt == null) setCategory(option); }} />)}
      </View>
      <TextField label="Activity name (optional for live sessions)" value={name} onChange={setName} placeholder={category === 'Strength' ? 'e.g. Upper body session' : 'e.g. Evening walk'} />
      <Card style={{ backgroundColor: '#F2ECFB', borderColor: '#E6DDF4', marginBottom: 0 }}>
        <Eyebrow>LIVE IPHONE MOTION SESSION</Eyebrow>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '900', marginTop: 5 }}>{sessionStartedAt != null ? 'Session in progress' : 'Capture a movement session'}</Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>{sessionStartedAt != null ? 'Keep Fitlog in the foreground and carry your phone as you move.' : 'Start when you begin. Fitlog records elapsed time, available steps and a summary of the device motion signal.'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 13 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 10 }}>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '900' }}>TIME</Text>
            <Text style={{ color: C.text, fontSize: 21, fontWeight: '900', marginTop: 4 }}>{timerLabel}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 10 }}>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '900' }}>SESSION STEPS</Text>
            <Text style={{ color: C.text, fontSize: 21, fontWeight: '900', marginTop: 4 }}>{sessionSteps.toLocaleString('en-IN')}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 10 }}>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '900' }}>MOTION RMS</Text>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 6 }}>{motionStats.rms.toFixed(2)}</Text>
            <Text style={{ color: C.muted, fontSize: 8 }}>m/s²</Text>
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 10, marginTop: 8 }}>{motionStats.samples.toLocaleString('en-IN')} motion samples summarized · {sessionSteps > 0 ? Math.round(sessionSteps / Math.max(sessionElapsedSeconds / 60, 1)) + ' steps/min so far' : 'waiting for steps'}</Text>
        <View style={{ marginTop: 12 }}>
          <ActionButton
            label={sessionStartedAt != null ? 'END & SAVE SESSION' : 'START LIVE SESSION'}
            onPress={sessionStartedAt != null ? stopMotionSession : startMotionSession}
          />
        </View>
        {motionSessionMessage !== '' && <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 9 }}>{motionSessionMessage}</Text>}
        <Text style={{ color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 8 }}>Motion RMS is an experimental signal, not a validated exercise-intensity or calorie estimate. It changes with phone placement. Raw samples stay in memory and are not saved.</Text>
      </Card>
      <Text style={{ color: C.muted, fontSize: 10, marginTop: 12 }}>Prefer not to use sensors? Add a timed session manually.</Text>
      <TextField label="Duration" value={minutes} onChange={setMinutes} placeholder="e.g. 35" keyboardType="decimal-pad" suffix="minutes" />
      <ActionButton label="SAVE MANUAL MOVEMENT  +" onPress={addWorkout} tone="soft" />
    </Card>
    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginBottom: 10 }}>Today's movement</Text>
    <Card>
      {todays.length === 0 ? <EmptyState emoji="🧘‍♀️" title="No sessions logged yet" subtitle="Rest days count too. Add movement only when it happens." /> :
        todays.slice().reverse().map(item => <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
          <View style={{ width: 40, height: 40, backgroundColor: C.lilac, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}><Text style={{ fontSize: 18 }}>{item.category === 'Strength' ? '🏋️' : item.category === 'Pilates' ? '🧘' : item.category === 'Run' ? '🏃' : item.category === 'Walk' ? '🚶' : '🌿'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 13 }}>{item.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.source === 'healthkit' ? 'Imported from Apple Health' : item.source === 'motion' ? 'iPhone motion session' : item.category}</Text>
            {item.source === 'motion' && <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>{item.steps != null ? item.steps.toLocaleString('en-IN') + ' steps' : 'No step data'}{item.cadenceSpm != null ? ' · ' + item.cadenceSpm + ' spm' : ''}{item.motionSamples != null ? ' · ' + item.motionSamples.toLocaleString('en-IN') + ' samples' : ''}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}><Text style={{ color: C.text, fontWeight: '900' }}>{item.minutes} min</Text>{item.activeCalories != null && <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>{item.activeCalories} kcal</Text>}</View>
          <TouchableOpacity onPress={() => removeWorkout(item.id)} style={{ marginLeft: 9, padding: 5 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>
        </View>)}
    </Card>
    <Card style={{ backgroundColor: C.butter, borderColor: '#F0E5CA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>A note on recovery ☁️</Text>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Energy values are estimates, not targets or food credits. Move because it supports your strength, energy and wellbeing—not to earn food.</Text>
    </Card>
  </ScrollView>;
}

function ProgressScreen({ data, update, onReset, onOpenCycle, selectedDate, onDateChange }: { data: FitlogData; update: UpdateData; onReset: () => void; onOpenCycle: () => void; selectedDate: string; onDateChange: (date: string) => void }) {
  const [weight, setWeight] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'in'>('cm');
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({
    bustCm: '', underbustCm: '', waistCm: '', abdomenCm: '', hipsCm: '', glutesCm: '',
    leftThighCm: '', rightThighCm: '', leftArmCm: '', rightArmCm: '',
    leftForearmCm: '', rightForearmCm: '', leftCalfCm: '', rightCalfCm: '', neckCm: '',
  });
  const [sleep, setSleep] = useState('');
  const date = selectedDate;
  const measurementFields: { key: string; label: string }[] = [
    { key: 'bustCm', label: 'Bust / chest' },
    { key: 'underbustCm', label: 'Underbust' },
    { key: 'waistCm', label: 'Waist' },
    { key: 'abdomenCm', label: 'Lower abdomen' },
    { key: 'hipsCm', label: 'Hips' },
    { key: 'glutesCm', label: 'Glutes' },
    { key: 'leftThighCm', label: 'Left thigh' },
    { key: 'rightThighCm', label: 'Right thigh' },
    { key: 'leftArmCm', label: 'Left upper arm' },
    { key: 'rightArmCm', label: 'Right upper arm' },
    { key: 'leftForearmCm', label: 'Left forearm' },
    { key: 'rightForearmCm', label: 'Right forearm' },
    { key: 'leftCalfCm', label: 'Left calf' },
    { key: 'rightCalfCm', label: 'Right calf' },
    { key: 'neckCm', label: 'Neck' },
  ];
  const changeMeasurement = (key: string, value: string) => setMeasurementValues(current => ({ ...current, [key]: value }));
  const sortedWeights = data.weights.filter(item => item.date <= date).slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const latest = sortedWeights[0];
  const previous = sortedWeights.find(item => item.id !== latest?.id);
  const addWeight = () => {
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 20 || value > 400) {
      Alert.alert('Check that weight', 'Enter a weight in kilograms between 20 and 400.');
      return;
    }
    update(current => ({ ...current, weights: [...current.weights, { id: makeId(), date, kg: value }] }));
    setWeight('');
  };
  const addMeasurements = () => {
    const values: Record<string, number> = {};
    for (const field of measurementFields) {
      const raw = measurementValues[field.key]?.trim();
      if (!raw) continue;
      const entered = Number(raw);
      const cm = measurementUnit === 'in' ? entered * 2.54 : entered;
      if (!Number.isFinite(cm) || cm < 5 || cm > 300) {
        Alert.alert('Check ' + field.label.toLowerCase(), 'Enter a value between 5 and 300 ' + measurementUnit + '.');
        return;
      }
      values[field.key] = Math.round(cm * 10) / 10;
    }
    if (Object.keys(values).length === 0) {
      Alert.alert('Add a measurement', 'Enter at least one measurement. You can leave the others blank.');
      return;
    }
    update(current => ({
      ...current,
      measurements: [...current.measurements, { id: makeId(), date, ...values }],
    }));
    setMeasurementValues({
      bustCm: '', underbustCm: '', waistCm: '', abdomenCm: '', hipsCm: '', glutesCm: '',
      leftThighCm: '', rightThighCm: '', leftArmCm: '', rightArmCm: '',
      leftForearmCm: '', rightForearmCm: '', leftCalfCm: '', rightCalfCm: '', neckCm: '',
    });
    Alert.alert('Measurements saved 🌷', 'Your check-in has been added to your history.');
  };
  const addSleep = () => {
    const hours = Number(sleep);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Check your sleep entry', 'Enter a number of hours between 0 and 24.');
      return;
    }
    update(current => ({ ...current, sleep: [...current.sleep, { id: makeId(), date, hours }] }));
    setSleep('');
  };
  const measurementsThroughDate = data.measurements.filter(item => item.date <= date).slice().sort((a, b) => b.date.localeCompare(a.date));
  const lastSleep = data.sleep.filter(item => item.date <= date).slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const periodCycles = (data.periodCycles ?? []).filter(item => item.startDate <= date && item.endDate <= date).slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const cycleStartsAscending = periodCycles.map(item => item.startDate).sort();
  const cycleIntervals = cycleStartsAscending.slice(1).map((start, index) => {
    const earlier = new Date(cycleStartsAscending[index] + 'T12:00:00');
    const later = new Date(start + 'T12:00:00');
    return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
  }).filter(days => days > 0 && days < 100);
  const averageCycleLength = cycleIntervals.length > 0
    ? Math.round(cycleIntervals.reduce((sum, days) => sum + days, 0) / cycleIntervals.length)
    : null;
  const formatCycleDate = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value + 'T12:00:00'));
  const getPeriodDays = (entry: (typeof periodCycles)[number]) => {
    const start = new Date(entry.startDate + 'T12:00:00');
    const end = new Date(entry.endDate + 'T12:00:00');
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  };

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="YOUR CHECK-INS  ✳  PROGRESS, NOT PERFECTION" title="Notice your growth 🌷" subtitle="A few calm check-ins help you notice longer-term patterns. No daily judgement, no pressure." />
    <DateNavigator selectedDate={selectedDate} onChange={onDateChange} />
    <Card style={{ backgroundColor: C.lilac }}>
      <Eyebrow>YOUR WEIGHT CHECK-IN</Eyebrow>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
        <View>
          <Text style={{ color: C.text, fontSize: 30, fontWeight: '900' }}>{latest ? latest.kg.toFixed(1) : '—'} <Text style={{ color: C.muted, fontSize: 12 }}>kg</Text></Text>
          <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{latest ? 'Latest entry · ' + latest.date : 'No weigh-in yet'}</Text>
        </View>
        {latest && previous && <View style={{ alignItems: 'flex-end' }}><Text style={{ color: C.accent, fontSize: 16, fontWeight: '900' }}>{(latest.kg - previous.kg) > 0 ? '+' : ''}{(latest.kg - previous.kg).toFixed(1)} kg</Text><Text style={{ color: C.muted, fontSize: 10 }}>vs previous entry</Text></View>}
      </View>
      <View style={{ height: 1, backgroundColor: '#E3D9F0', marginVertical: 15 }} />
      <Text style={{ color: C.muted, fontSize: 11 }}>Goal weight · {data.profile.goalWeightKg.toFixed(1)} kg</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginTop: 13 }}>
        <View style={{ flex: 1 }}><TextField label="New weigh-in" value={weight} onChange={setWeight} placeholder="e.g. 62.5" keyboardType="decimal-pad" suffix="kg" /></View>
        <View style={{ paddingBottom: 13 }}><ActionButton label="SAVE" onPress={addWeight} /></View>
      </View>
    </Card>
    <Card>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginBottom: 5 }}>Body measurements 📏</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 14 }}>Track as many or as few as you like. Leave anything blank if you don't want to record it.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <Eyebrow>MEASUREMENT UNIT</Eyebrow>
        <View style={{ flexDirection: 'row' }}>
          <Chip label="cm" selected={measurementUnit === 'cm'} onPress={() => setMeasurementUnit('cm')} />
          <Chip label="inches" selected={measurementUnit === 'in'} onPress={() => setMeasurementUnit('in')} />
        </View>
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 9 }}>TORSO</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {measurementFields.slice(0, 6).map(field => <View key={field.key} style={{ width: '48%' }}>
          <TextField label={field.label} value={measurementValues[field.key]} onChange={value => changeMeasurement(field.key, value)} placeholder="—" keyboardType="decimal-pad" suffix={measurementUnit} />
        </View>)}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginTop: 4, marginBottom: 9 }}>LEGS & ARMS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {measurementFields.slice(6, 14).map(field => <View key={field.key} style={{ width: '48%' }}>
          <TextField label={field.label} value={measurementValues[field.key]} onChange={value => changeMeasurement(field.key, value)} placeholder="—" keyboardType="decimal-pad" suffix={measurementUnit} />
        </View>)}
      </View>
      <TextField label="Neck" value={measurementValues.neckCm} onChange={value => changeMeasurement('neckCm', value)} placeholder="—" keyboardType="decimal-pad" suffix={measurementUnit} />
      <ActionButton label="SAVE MEASUREMENTS  +" onPress={addMeasurements} tone="soft" />
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 9 }}>Saved values are stored in centimetres, even when entered in inches, so your history stays consistent.</Text>
    </Card>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginBottom: 9 }}>Measurement history</Text>
    <Card>
      {measurementsThroughDate.length === 0 ? <EmptyState emoji="🌿" title="Your first measurements will live here" subtitle="You can create a check-in with just one measurement or a full set." /> :
        measurementsThroughDate.slice(0, 5).map(entry => {
          const measurementRecord = entry as unknown as Record<string, unknown>;
          const values = measurementFields
            .filter(field => measurementRecord[field.key] !== undefined)
            .map(field => field.label + ' ' + Number(measurementRecord[field.key]).toFixed(1) + ' cm');
          return <View key={entry.id} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{entry.date}</Text>
            <Text style={{ color: C.muted, fontSize: 10, lineHeight: 17, marginTop: 5 }}>{values.join('  ·  ') || 'No measurement values'}</Text>
          </View>;
        })}
    </Card>
    <Card style={{ backgroundColor: C.mint, borderColor: '#D8E9DC' }}>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginBottom: 6 }}>How did you sleep? 🌙</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>Log your sleep duration manually. iPhone motion sensors do not provide sleep stages.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 9 }}>
        <View style={{ flex: 1 }}><TextField label="Sleep duration" value={sleep} onChange={setSleep} placeholder="e.g. 7.5" keyboardType="decimal-pad" suffix="hours" /></View>
        <View style={{ paddingBottom: 13 }}><ActionButton label="SAVE" onPress={addSleep} /></View>
      </View>
      {lastSleep && <Text style={{ color: C.green, fontSize: 11, fontWeight: '800' }}>Latest: {lastSleep.hours} hours · {lastSleep.date}{lastSleep.source === 'healthkit' ? ' · Apple Health' : ''}</Text>}
    </Card>
    <Card style={{ backgroundColor: '#FFF5F7', borderColor: '#F0DEE5' }}>
      <Eyebrow>REPRODUCTIVE HEALTH  ✳  CYCLE JOURNAL</Eyebrow>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginTop: 5 }}>Cycle history 🌸</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6 }}>
        Period entries imported from Apple Health or added manually in Fitlog. The full tracker lets you backfill dates and record optional daily notes.
      </Text>
      {periodCycles.length === 0 ? <EmptyState emoji="🌷" title="No period dates yet" subtitle="Add a manual period entry or import one from Apple Health using the full tracker." /> : <>
        <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 14 }}>
            <Text style={{ color: C.rose, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>LAST RECORDED START</Text>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: '900', marginTop: 6 }}>{formatCycleDate(periodCycles[0].startDate)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 14 }}>
            <Text style={{ color: C.rose, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>AVERAGE RECORDED CYCLE</Text>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 6 }}>{averageCycleLength != null ? averageCycleLength + ' days' : '—'}</Text>
            <Text style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{cycleIntervals.length} interval{cycleIntervals.length === 1 ? '' : 's'} recorded</Text>
          </View>
        </View>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 13, marginTop: 16, marginBottom: 4 }}>Recent periods</Text>
        {periodCycles.slice(0, 6).map(entry => <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3E5EA' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{formatCycleDate(entry.startDate)}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>Recorded duration · {getPeriodDays(entry)} day{getPeriodDays(entry) === 1 ? '' : 's'}</Text>
          </View>
          <Text style={{ color: C.rose, fontSize: 11, fontWeight: '900', textTransform: 'capitalize' }}>{entry.flow} flow</Text>
        </View>)}
      </>}
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 11 }}>Only your recorded period entries are shown. Cycle averages describe past dates and are not a forecast or contraceptive guidance.</Text>
      <View style={{ marginTop: 13 }}><ActionButton label="OPEN FULL CYCLE TRACKER  →" onPress={onOpenCycle} tone="soft" /></View>
    </Card>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginBottom: 9 }}>Recent weigh-ins</Text>
    <Card>
      {sortedWeights.length === 0 ? <EmptyState emoji="🌱" title="Your first check-in is waiting" subtitle="Add a weigh-in whenever it feels useful. You don't need to weigh every day." /> :
        sortedWeights.slice(0, 7).map(item => <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>{item.date}</Text><Text style={{ color: C.text, fontWeight: '900' }}>{item.kg.toFixed(1)} kg</Text>
        </View>)}
    </Card>
    <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>Weight naturally fluctuates with hydration, digestion, training and your cycle. Look at longer trends, not single readings.</Text>
    <Card style={{ backgroundColor: '#FFFCFA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>Your data, your call 🔐</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 18, marginTop: 6 }}>This prototype stores entries locally on this iPhone. There is no Fitlog cloud account or sync yet.</Text>
      <TouchableOpacity onPress={() => Alert.alert('Reset Fitlog on this iPhone?', 'This deletes your local profile, food diary, workouts and check-ins from this app. This cannot be undone.', [
        { text: 'Keep my data', style: 'cancel' },
        { text: 'Delete local data', style: 'destructive', onPress: onReset },
      ])} style={{ alignSelf: 'flex-start', paddingVertical: 10, marginTop: 5 }}>
        <Text style={{ color: '#B27D87', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 }}>RESET LOCAL APP DATA</Text>
      </TouchableOpacity>
    </Card>
  </ScrollView>;
}


type CycleMoodValue = '' | 'very-low' | 'low' | 'neutral' | 'good' | 'very-good';
type CycleAppetiteValue = '' | 'lower' | 'usual' | 'higher';
type CycleBloatingValue = '' | 'none' | 'mild' | 'moderate' | 'severe';
type CycleHormoneType = '' | 'regular_contraception' | 'emergency_contraception' | 'other_hormonal_medication';

function CycleScreen({ data, update, initialDate, onBack }: {
  data: FitlogData;
  update: UpdateData;
  initialDate: string;
  onBack: () => void;
}) {
  const [periodStart, setPeriodStart] = useState(initialDate);
  const [periodEnd, setPeriodEnd] = useState(initialDate);
  const [flow, setFlow] = useState<'unspecified' | 'light' | 'medium' | 'heavy'>('unspecified');
  const [entryDate, setEntryDate] = useState(initialDate);
  const [mood, setMood] = useState<CycleMoodValue>('');
  const [appetite, setAppetite] = useState<CycleAppetiteValue>('');
  const [bloating, setBloating] = useState<CycleBloatingValue>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [cravings, setCravings] = useState<string[]>([]);
  const [sexualActivity, setSexualActivity] = useState<'not-recorded' | 'yes' | 'no'>('not-recorded');
  const [contraceptionMethod, setContraceptionMethod] = useState('');
  const [hormoneType, setHormoneType] = useState<CycleHormoneType>('');
  const [hormoneName, setHormoneName] = useState('');
  const [notes, setNotes] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);

  useEffect(() => {
    setPeriodStart(initialDate);
    setPeriodEnd(initialDate);
    setEntryDate(initialDate);
  }, [initialDate]);

  const periodEntries = (data.periodCycles ?? []).slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const journalEntries = (data.cycleJournal ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const formatCycleDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(value + 'T12:00:00'));
  const validDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T12:00:00');
    return !Number.isNaN(parsed.getTime()) && localDateKey(parsed) === value;
  };
  const dayDifference = (later: string, earlier: string) => Math.round(
    (new Date(later + 'T12:00:00').getTime() - new Date(earlier + 'T12:00:00').getTime()) / 86_400_000
  );
  const daysInPeriod = (period: NonNullable<FitlogData['periodCycles']>[number]) =>
    Math.max(1, dayDifference(period.endDate, period.startDate) + 1);

  const savePeriod = () => {
    if (!validDate(periodStart) || !validDate(periodEnd) || periodEnd < periodStart) {
      Alert.alert('Check the period dates', 'Enter valid dates in YYYY-MM-DD format. The end date must be on or after the start date.');
      return;
    }
    if (periodEntries.some(item => item.startDate === periodStart)) {
      Alert.alert('Period already recorded', 'A period with this start date is already in your history. Remove the existing manual entry instead of adding a duplicate.');
      return;
    }
    const entry = {
      id: makeId(),
      startDate: periodStart,
      endDate: periodEnd,
      flow,
      source: 'manual' as const,
      healthKitSampleIds: [],
    };
    update(current => ({ ...current, periodCycles: [...(current.periodCycles ?? []), entry] }));
    setPeriodStart(initialDate);
    setPeriodEnd(initialDate);
    setFlow('unspecified');
    Alert.alert('Period dates saved', 'Your period entry has been stored on this iPhone.');
  };

  const clearJournalForm = () => {
    setMood('');
    setAppetite('');
    setBloating('');
    setSymptoms([]);
    setCravings([]);
    setSexualActivity('not-recorded');
    setContraceptionMethod('');
    setHormoneType('');
    setHormoneName('');
    setNotes('');
    setShowSensitive(false);
  };

  const toggleValue = (values: string[], value: string, setValues: (next: string[]) => void) => {
    setValues(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  };

  const saveJournal = () => {
    if (!validDate(entryDate)) {
      Alert.alert('Check the log date', 'Enter a valid date in YYYY-MM-DD format.');
      return;
    }
    const hasContent = Boolean(mood || appetite || bloating || symptoms.length || cravings.length ||
      sexualActivity !== 'not-recorded' || contraceptionMethod.trim() || (hormoneType && hormoneName.trim()) || notes.trim());
    if (!hasContent) {
      Alert.alert('Nothing to save yet', 'Choose at least one optional check-in item. You can leave every other field blank.');
      return;
    }
    const existing = (data.cycleJournal ?? []).find(item => item.date === entryDate);
    const entry: CycleJournalEntry = {
      id: existing?.id ?? makeId(),
      date: entryDate,
      ...(mood ? { mood } : {}),
      ...(appetite ? { appetite } : {}),
      ...(bloating ? { bloating } : {}),
      ...(symptoms.length ? { symptoms } : {}),
      ...(cravings.length ? { cravings } : {}),
      ...(sexualActivity !== 'not-recorded' ? { sexualActivity } : {}),
      ...(contraceptionMethod.trim() ? { contraceptionMethod: contraceptionMethod.trim() } : {}),
      ...(hormoneType && hormoneName.trim() ? { hormonalMedicationType: hormoneType, hormonalMedicationName: hormoneName.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    update(current => ({
      ...current,
      cycleJournal: [...(current.cycleJournal ?? []).filter(item => item.date !== entryDate), entry],
    }));
    clearJournalForm();
    Alert.alert(existing ? 'Daily check-in updated' : 'Daily check-in saved', 'Your optional cycle notes are stored locally.');
  };

  const editJournal = (entry: NonNullable<FitlogData['cycleJournal']>[number]) => {
    setEntryDate(entry.date);
    setMood(entry.mood ?? '');
    setAppetite(entry.appetite ?? '');
    setBloating(entry.bloating ?? '');
    setSymptoms(entry.symptoms ?? []);
    setCravings(entry.cravings ?? []);
    setSexualActivity(entry.sexualActivity ?? 'not-recorded');
    setContraceptionMethod(entry.contraceptionMethod ?? '');
    setHormoneType(entry.hormonalMedicationType ?? '');
    setHormoneName(entry.hormonalMedicationName ?? '');
    setNotes(entry.notes ?? '');
    setShowSensitive(true);
  };

  const removeJournal = (date: string) => Alert.alert('Delete this private check-in?', 'This removes the selected day from your local cycle journal.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => update(current => ({
      ...current,
      cycleJournal: (current.cycleJournal ?? []).filter(item => item.date !== date),
    })) },
  ]);
  const removeManualPeriod = (id: string) => Alert.alert('Remove this period entry?', 'This only removes the manual period record from Fitlog. Apple Health records are not changed.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => update(current => ({
      ...current,
      periodCycles: (current.periodCycles ?? []).filter(item => item.id !== id),
    })) },
  ]);

  const moodScores: Record<Exclude<CycleMoodValue, ''>, number> = {
    'very-low': 1, low: 2, neutral: 3, good: 4, 'very-good': 5,
  };
  const bloatingScores: Record<Exclude<CycleBloatingValue, ''>, number> = {
    none: 0, mild: 1, moderate: 2, severe: 3,
  };
  const phaseAtDate = (date: string): 'before' | 'period' | 'other' => {
    let phase: 'before' | 'period' | 'other' = 'other';
    let closestDistance = Infinity;
    for (const period of periodEntries) {
      const offset = dayDifference(date, period.startDate);
      const inWindow = offset >= -5 && offset < daysInPeriod(period);
      if (inWindow && Math.abs(offset) < closestDistance) {
        closestDistance = Math.abs(offset);
        phase = offset < 0 ? 'before' : 'period';
      }
    }
    return phase;
  };
  const classified = journalEntries.map(entry => ({ entry, phase: phaseAtDate(entry.date) }));
  const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const patternNotes: string[] = [];
  const beforeMood = classified.filter(item => item.phase === 'before' && item.entry.mood).map(item => moodScores[item.entry.mood as Exclude<CycleMoodValue, ''>]);
  const otherMood = classified.filter(item => item.phase === 'other' && item.entry.mood).map(item => moodScores[item.entry.mood as Exclude<CycleMoodValue, ''>]);
  if (beforeMood.length >= 3 && otherMood.length >= 3) {
    const a = mean(beforeMood)!;
    const b = mean(otherMood)!;
    if (Math.abs(a - b) >= 0.5) {
      patternNotes.push('Your logged mood score averaged ' + a.toFixed(1) + ' in the five days before a recorded period and ' + b.toFixed(1) + ' on other logged days.');
    }
  }
  const beforeDays = classified.filter(item => item.phase === 'before');
  const otherDays = classified.filter(item => item.phase === 'other');
  const beforeCravings = beforeDays.length ? beforeDays.filter(item => (item.entry.cravings?.length ?? 0) > 0).length / beforeDays.length : null;
  const otherCravings = otherDays.length ? otherDays.filter(item => (item.entry.cravings?.length ?? 0) > 0).length / otherDays.length : null;
  if (beforeCravings != null && otherCravings != null &&
      beforeDays.length >= 3 && otherDays.length >= 3 &&
      Math.abs(beforeCravings - otherCravings) >= 0.2) {
    patternNotes.push('Cravings were logged on ' + (beforeCravings * 100).toFixed(0) + '% of pre-period check-in days versus ' + (otherCravings * 100).toFixed(0) + '% of other logged days.');
  }
  const periodBloating = classified.filter(item => (item.phase === 'before' || item.phase === 'period') && item.entry.bloating)
    .map(item => bloatingScores[item.entry.bloating as Exclude<CycleBloatingValue, ''>]);
  const otherBloating = classified.filter(item => item.phase === 'other' && item.entry.bloating)
    .map(item => bloatingScores[item.entry.bloating as Exclude<CycleBloatingValue, ''>]);
  if (periodBloating.length >= 3 && otherBloating.length >= 3) {
    const a = mean(periodBloating)!;
    const b = mean(otherBloating)!;
    if (Math.abs(a - b) >= 0.5) {
      patternNotes.push('Your bloating score averaged ' + a.toFixed(1) + ' around recorded periods and ' + b.toFixed(1) + ' on other logged days.');
    }
  }
  const weightAroundPeriods = data.weights.filter(item => phaseAtDate(item.date) !== 'other').map(item => item.kg);
  const weightOnOtherDays = data.weights.filter(item => phaseAtDate(item.date) === 'other').map(item => item.kg);
  if (weightAroundPeriods.length >= 3 && weightOnOtherDays.length >= 3) {
    const a = mean(weightAroundPeriods)!;
    const b = mean(weightOnOtherDays)!;
    if (Math.abs(a - b) >= 0.3) {
      patternNotes.push('Recorded weight averaged ' + a.toFixed(1) + ' kg in the five days before or during logged periods and ' + b.toFixed(1) + ' kg on other logged days. Hydration, digestion and other factors can also affect these readings.');
    }
  }

  const orderedPeriods = periodEntries.slice().sort((a, b) => a.startDate.localeCompare(b.startDate));
  const intervals = orderedPeriods.slice(1).map((item, index) => dayDifference(item.startDate, orderedPeriods[index].startDate)).filter(days => days > 0 && days < 100);
  const averageCycleInterval = mean(intervals);

  const symptomOptions = ['Cramps', 'Headache', 'Fatigue', 'Acne', 'Breast tenderness', 'Nausea', 'Low back pain', 'Bowel changes'];
  const cravingOptions = ['Chocolate', 'Sweet', 'Salty', 'Carbs', 'Comfort food'];
  const moodOptions: { value: Exclude<CycleMoodValue, ''>; label: string }[] = [
    { value: 'very-low', label: 'Very low' }, { value: 'low', label: 'Low' }, { value: 'neutral', label: 'Neutral' },
    { value: 'good', label: 'Good' }, { value: 'very-good', label: 'Very good' },
  ];

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <View style={{ marginBottom: 18 }}>
      <TouchableOpacity onPress={onBack} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.lilac, marginBottom: 15 }}>
        <Text style={{ color: C.accent, fontSize: 11, fontWeight: '900' }}>← BACK TO PROGRESS</Text>
      </TouchableOpacity>
      <PageTitle eyebrow="REPRODUCTIVE HEALTH  ✳  PRIVATE JOURNAL" title="Cycle tracker 🌸" subtitle="Log only what feels useful. You can backfill earlier dates, edit entries and delete them at any time." />
    </View>

    <Card style={{ backgroundColor: '#FFF5F7', borderColor: '#F0DEE5' }}>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 18 }}>Period history</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>Enter historical start and end dates manually. HealthKit imports remain labelled separately.</Text>
      <TextField label="Period start date" value={periodStart} onChange={setPeriodStart} placeholder="YYYY-MM-DD" />
      <TextField label="Period end date" value={periodEnd} onChange={setPeriodEnd} placeholder="YYYY-MM-DD" />
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginBottom: 8 }}>FLOW (OPTIONAL)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['unspecified', 'light', 'medium', 'heavy'] as const).map(value =>
          <Chip key={value} label={value === 'unspecified' ? 'Not set' : value[0].toUpperCase() + value.slice(1)} selected={flow === value} onPress={() => setFlow(value)} />
        )}
      </View>
      <ActionButton label="SAVE PERIOD DATES  +" onPress={savePeriod} />
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 9 }}>Dates use your iPhone's local calendar. This tracker does not forecast ovulation or provide contraceptive guidance.</Text>
    </Card>

    <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 9 }}>Recorded periods</Text>
    <Card>
      {periodEntries.length === 0 ? <EmptyState emoji="🌷" title="No period dates yet" subtitle="Add a period above, or import a record through Apple Health." /> :
        periodEntries.slice(0, 12).map(item => <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3E5EA' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{formatCycleDate(item.startDate)} – {formatCycleDate(item.endDate)}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{daysInPeriod(item)} days · {item.source === 'healthkit' ? 'Apple Health' : 'Manual entry'}</Text>
          </View>
          <Text style={{ color: C.rose, fontSize: 10, fontWeight: '900', textTransform: 'capitalize' }}>{item.flow}</Text>
          {item.source === 'manual' && <TouchableOpacity onPress={() => removeManualPeriod(item.id)} style={{ marginLeft: 10, padding: 5 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>}
        </View>)}
      {periodEntries.length > 1 && <Text style={{ color: C.muted, fontSize: 10, marginTop: 11 }}>Average gap between recorded starts: {averageCycleInterval != null ? averageCycleInterval.toFixed(0) + ' days' : 'not enough valid intervals'}. This describes the logged history only.</Text>}
    </Card>

    <Card>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginBottom: 5 }}>Daily body & mood check-in</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 12 }}>Choose a past or current date. Leave any category blank if you don't want to track it.</Text>
      <TextField label="Check-in date" value={entryDate} onChange={setEntryDate} placeholder="YYYY-MM-DD" />
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginBottom: 7 }}>MOOD</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {moodOptions.map(option => <Chip key={option.value} label={option.label} selected={mood === option.value} onPress={() => setMood(mood === option.value ? '' : option.value)} />)}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginTop: 8, marginBottom: 7 }}>APPETITE</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {([{ value: 'lower', label: 'Lower' }, { value: 'usual', label: 'Usual' }, { value: 'higher', label: 'Higher' }] as const).map(option =>
          <Chip key={option.value} label={option.label} selected={appetite === option.value} onPress={() => setAppetite(appetite === option.value ? '' : option.value)} />
        )}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginTop: 8, marginBottom: 7 }}>BLOATING</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {([{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }] as const).map(option =>
          <Chip key={option.value} label={option.label} selected={bloating === option.value} onPress={() => setBloating(bloating === option.value ? '' : option.value)} />
        )}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginTop: 8, marginBottom: 7 }}>SYMPTOMS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {symptomOptions.map(value => <Chip key={value} label={value} selected={symptoms.includes(value)} onPress={() => toggleValue(symptoms, value, setSymptoms)} />)}
      </View>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginTop: 8, marginBottom: 7 }}>CRAVINGS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cravingOptions.map(value => <Chip key={value} label={value} selected={cravings.includes(value)} onPress={() => toggleValue(cravings, value, setCravings)} />)}
      </View>

      <TouchableOpacity onPress={() => setShowSensitive(value => !value)} style={{ marginTop: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: C.rose, fontWeight: '900', fontSize: 12 }}>OPTIONAL · SEXUAL ACTIVITY & MEDICATION</Text>
        <Text style={{ color: C.rose, fontWeight: '900' }}>{showSensitive ? '−' : '+'}</Text>
      </TouchableOpacity>
      {showSensitive && <View style={{ backgroundColor: '#FFF7F8', borderRadius: 15, padding: 12, marginBottom: 12 }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginBottom: 7 }}>SEXUAL ACTIVITY</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Not recorded" selected={sexualActivity === 'not-recorded'} onPress={() => setSexualActivity('not-recorded')} />
          <Chip label="Yes" selected={sexualActivity === 'yes'} onPress={() => setSexualActivity('yes')} />
          <Chip label="No" selected={sexualActivity === 'no'} onPress={() => setSexualActivity('no')} />
        </View>
        <TextField label="Contraception method (optional)" value={contraceptionMethod} onChange={setContraceptionMethod} placeholder="e.g. condom, pill, IUD" />
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', marginBottom: 7 }}>HORMONAL MEDICATION / CONTRACEPTION EVENT</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Regular contraception" selected={hormoneType === 'regular_contraception'} onPress={() => setHormoneType(hormoneType === 'regular_contraception' ? '' : 'regular_contraception')} />
          <Chip label="Emergency contraception" selected={hormoneType === 'emergency_contraception'} onPress={() => setHormoneType(hormoneType === 'emergency_contraception' ? '' : 'emergency_contraception')} />
          <Chip label="Other hormone medication" selected={hormoneType === 'other_hormonal_medication'} onPress={() => setHormoneType(hormoneType === 'other_hormonal_medication' ? '' : 'other_hormonal_medication')} />
        </View>
        {hormoneType !== '' && <TextField label="Medication / method name" value={hormoneName} onChange={setHormoneName} placeholder="Optional name" />}
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15 }}>These fields are optional. They stay in Fitlog's encrypted local journal and are not sent to an AI service.</Text>
      </View>}
      <TextField label="Private note (optional)" value={notes} onChange={setNotes} placeholder="Anything you want to remember" />
      <ActionButton label="SAVE DAILY CHECK-IN  ✓" onPress={saveJournal} />
    </Card>

    <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 9 }}>Your daily log</Text>
    <Card>
      {journalEntries.length === 0 ? <EmptyState emoji="🌱" title="No daily notes yet" subtitle="You can start with just mood, bloating or one symptom." /> :
        journalEntries.slice(0, 10).map(entry => <View key={entry.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{formatCycleDate(entry.date)}</Text>
              <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 4 }}>
                {[entry.mood?.replace('-', ' '), entry.appetite ? 'appetite ' + entry.appetite : '', entry.bloating ? 'bloating ' + entry.bloating : '', ...(entry.symptoms ?? []), ...(entry.cravings ?? []).map(value => value + ' craving')].filter(Boolean).join(' · ') || 'Private note'}
              </Text>
              {(entry.sexualActivity || entry.contraceptionMethod || entry.hormonalMedicationName) && <Text style={{ color: C.rose, fontSize: 9, marginTop: 4 }}>Contains private sexual-health / medication details</Text>}
            </View>
            <TouchableOpacity onPress={() => editJournal(entry)} style={{ padding: 6 }}><Text style={{ color: C.accent, fontWeight: '900', fontSize: 10 }}>EDIT</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => removeJournal(entry.date)} style={{ padding: 6 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>
          </View>
        </View>)}
    </Card>

    <Card style={{ backgroundColor: C.lilac }}>
      <Text style={{ color: C.text, fontSize: 17, fontWeight: '900' }}>Patterns from your entries ✨</Text>
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 5 }}>These are simple local comparisons of your own check-ins around recorded period dates, not diagnoses or proof that hormones caused a symptom.</Text>
      {periodEntries.length < 2 || journalEntries.length < 8
        ? <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 10 }}>Keep logging at your own pace. Patterns need at least two recorded period starts and eight daily check-ins before Fitlog compares phases.</Text>
        : patternNotes.length === 0
          ? <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 10 }}>There isn't enough repeated information in the current logs to highlight a pattern yet. That is okay; no pattern is also useful.</Text>
          : patternNotes.map((note, index) => <Text key={index} style={{ color: C.text, fontSize: 11, lineHeight: 18, marginTop: 9 }}>• {note}</Text>)}
      <Text style={{ color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 10 }}>Fitlog does not infer fertility, predict ovulation, assess pregnancy risk or recommend contraception. Cycle timing can vary for many reasons, including medication and stress.</Text>
    </Card>

    <Card style={{ backgroundColor: C.mint, borderColor: '#D8E9DC' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>Your cycle data stays yours 🔐</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>Cycle, sexual-activity and medication entries are saved in Fitlog's encrypted on-device database. No cycle data is sent to an AI service. You can edit or delete individual records.</Text>
    </Card>
  </ScrollView>;
}

function LoadingScreen() {
  return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 34 }}>🌷</Text>
    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginTop: 12 }}>Getting your little space ready...</Text>
  </View>;
}

export default function App() {
  const [data, setData] = useState<FitlogData | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [saveFailed, setSaveFailed] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStorageError(null);
    loadFitlogData()
      .then(saved => {
        if (active && saved) setData(saved);
      })
      .catch(error => {
        if (active) {
          setStorageError(error instanceof Error ? error.message : 'Fitlog could not unlock its encrypted local database.');
        }
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    if (!data || !ready || storageError) return;
    saveFitlogData(data)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, [data, ready, storageError]);

  const update: UpdateData = useCallback((recipe: (current: FitlogData) => FitlogData) => setData(current => current ? recipe(current) : current), []);
  const finishOnboarding = (profile: AssessmentInput) => {
    const result = assess(profile);
    setData(createInitialData(profile, result));
    setSelectedDate(localDateKey());
    setTab('today');
  };

  if (!ready) return <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}><LoadingScreen /></SafeAreaView></SafeAreaProvider>;
  if (storageError) return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', padding: 24 }}>
      <Card style={{ backgroundColor: '#FFF5F2', borderColor: '#EFD8D2' }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Fitlog couldn't unlock your private data 🔐</Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 10 }}>{storageError}</Text>
        <Text style={{ color: C.rose, fontSize: 11, lineHeight: 17, marginTop: 10 }}>Your existing database has not been reset. Do not uninstall Fitlog or clear its app data while we investigate.</Text>
        <View style={{ marginTop: 16 }}>
          <ActionButton label="RETRY SECURE STORAGE" onPress={() => { setReady(false); setStorageError(null); setLoadAttempt(value => value + 1); }} />
        </View>
      </Card>
    </SafeAreaView>
  </SafeAreaProvider>;
  return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      {!data ? <Onboarding onComplete={(profile) => finishOnboarding(profile)} /> : <>
        <View style={{ flex: 1 }}>
          {tab === 'today' && <TodayScreen data={data} update={update} goTo={setTab} selectedDate={selectedDate} onDateChange={setSelectedDate} />}
          {tab === 'food' && <FoodScreen data={data} update={update} selectedDate={selectedDate} onDateChange={setSelectedDate} />}
          <View style={{ flex: 1, display: tab === 'move' ? 'flex' : 'none' }}><MoveScreen data={data} update={update} isActive={tab === 'move'} selectedDate={selectedDate} onDateChange={setSelectedDate} /></View>
          {tab === 'cycle' && <CycleScreen data={data} update={update} initialDate={selectedDate} onBack={() => setTab('progress')} />}
          {tab === 'progress' && <ProgressScreen data={data} update={update} selectedDate={selectedDate} onDateChange={setSelectedDate} onOpenCycle={() => setTab('cycle')} onReset={() => {
            clearFitlogData()
              .then(() => { setData(null); setSelectedDate(localDateKey()); setTab('today'); })
              .catch(() => Alert.alert('Could not reset', 'Please try again after checking your device storage.'));
          }} />}
          {saveFailed && <Text style={{ color: '#A45F60', fontSize: 10, textAlign: 'center', paddingVertical: 4 }}>Could not save changes to this iPhone. Check available storage.</Text>}
        </View>
        <TabBar selected={tab === 'cycle' ? 'progress' : tab} onSelect={setTab} />
      </>}
    </SafeAreaView>
  </SafeAreaProvider>;
}
