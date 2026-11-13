import { AssessmentInput, assess } from './assessment';

export type AssessmentResult = ReturnType<typeof assess>;
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type FoodEntry = {
  id: string;
  date: string;
  name: string;
  meal: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: number;
  estimateMethod?: 'catalogue' | 'manual';
  ingredients?: Array<{ foodId: string; name: string; grams: number }>;
};

export type WorkoutEntry = {
  id: string;
  date: string;
  name: string;
  category: string;
  minutes: number;
  createdAt: number;
};

export type WeightEntry = { id: string; date: string; kg: number };
export type SleepEntry = { id: string; date: string; hours: number };
export type MeasurementEntry = {
  id: string;
  date: string;
  bustCm?: number;
  underbustCm?: number;
  waistCm?: number;
  abdomenCm?: number;
  hipsCm?: number;
  glutesCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftForearmCm?: number;
  rightForearmCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  neckCm?: number;
};

export type DailyActivityEntry = {
  date: string;
  steps?: number;
  activeCalories?: number;
  source?: 'manual' | 'healthkit';
};

export type FitlogData = {
  version: 1;
  profile: AssessmentInput;
  assessment: AssessmentResult;
  food: FoodEntry[];
  workouts: WorkoutEntry[];
  weights: WeightEntry[];
  sleep: SleepEntry[];
  measurements: MeasurementEntry[];
  waterByDate: Record<string, number>;
  activityByDate?: Record<string, DailyActivityEntry>;
};

export const STORAGE_KEY = '@fitlog/data/v1';

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createInitialData(profile: AssessmentInput, assessment: AssessmentResult): FitlogData {
  return {
    version: 1,
    profile,
    assessment,
    food: [],
    workouts: [],
    weights: [{ id: makeId(), date: localDateKey(), kg: profile.weightKg }],
    sleep: [],
    measurements: [],
    waterByDate: {},
    activityByDate: {},
  };
}
