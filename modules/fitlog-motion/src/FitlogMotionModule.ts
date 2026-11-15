import { requireOptionalNativeModule } from 'expo';

export type NativeMotionCapabilities = {
  stepCounting: boolean;
  distance: boolean;
  floorCounting: boolean;
  pace: boolean;
  cadence: boolean;
  authorizationStatus: 'notDetermined' | 'restricted' | 'denied' | 'authorized' | 'unknown';
};

export type NativePedometerSnapshot = {
  steps: number;
  distanceMeters?: number | null;
  floorsAscended?: number | null;
  floorsDescended?: number | null;
  currentPaceSecondsPerMeter?: number | null;
  averageActivePaceSecondsPerMeter?: number | null;
  currentCadenceStepsPerSecond?: number | null;
};

type NativeFitlogMotion = {
  getCapabilities: () => NativeMotionCapabilities;
  queryPedometerData: (startTimestampMs: number, endTimestampMs: number) => Promise<NativePedometerSnapshot>;
  startUpdates: (startTimestampMs: number) => boolean;
  stopUpdates: () => void;
  addListener: {
    (eventName: 'onPedometerUpdate', listener: (event: NativePedometerSnapshot) => void): { remove: () => void };
    (eventName: 'onPedometerError', listener: (event: { message: string }) => void): { remove: () => void };
  };
};

// Expo Go doesn't bundle this project-specific native module. The step-only Expo Pedometer
// remains the fallback there; a local iOS development build includes the native bridge.
const FitlogMotion = requireOptionalNativeModule('FitlogMotion') as NativeFitlogMotion | null;

export default FitlogMotion;
