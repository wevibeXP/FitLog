# Fitlog

Fitlog is an iOS-first personal wellness tracker built with Expo and React Native. The visual direction is soft pastel, warm, and deliberately non-clinical.

## Current MVP

- Six-step onboarding and a provisional energy / macro assessment.
- Today dashboard with daily food totals, macro progress, iPhone pedometer steps and optional externally sourced active calories.
- Move dashboard with detailed daily movement metrics, live iPhone steps, walking distance, floors, pace and workout logging.
- Active-energy estimate combines step-derived energy and logged workout-session energy while subtracting session-associated steps to reduce double counting.
- Resting-energy estimate based on profile BMR.
- Native iOS Core Motion module wrapping Apple's CMPedometer for steps, distance, floors ascended/descended, pace and cadence.
- Expo Go fallback using Expo Sensors Pedometer for steps and DeviceMotion for user-started sessions.
- Live session summaries include elapsed time, available session steps, step cadence and an experimental acceleration RMS signal. Raw motion samples are processed in memory and not saved.
- Searchable starter food catalogue (including common South Indian and Indian foods) with automatic portion-based calories, protein, carbs and fat estimates.
- Multi-ingredient meal builder so a meal such as eggs + toast can be totalled together.
- Optional manual nutrition fallback for foods and homemade recipes not yet in the catalogue.
- Movement log for strength, Pilates, walking, running, cycling and mobility.
- Water intake quick logging.
- Progress check-ins for weight, bust, underbust, waist, lower abdomen, hips, glutes, left/right thighs, upper arms, forearms, calves, neck and manually logged sleep.
- Measurement history saved as dated snapshots, with cm or inch input (stored consistently in cm).
- Local persistence on the iPhone using AsyncStorage.
- iOS-only Expo configuration.

## Run in Expo Go

Requirements:
- Node.js 22.13+
- Expo Go installed on your iPhone

Install and validate from the Codespaces terminal:

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npx tsc --noEmit
npx expo start --go --tunnel --clear
```

Scan the QR code with the iPhone Camera and open the project in Expo Go. Keep the Codespace running while testing. The iPhone must be carried for the pedometer to count its steps. Expo Go includes the step-only fallback; the project-specific Core Motion bridge below is not loaded by Expo Go.

## Native iOS development build

Fitlog's local Expo module at `modules/fitlog-motion` wraps Apple's `CMPedometer`. It reads system-generated steps, distance, floors climbed/descended, current and average active pace, and cadence when the iPhone reports those capabilities. The module checks device capability and leaves unsupported metrics unavailable instead of inventing values.

To compile and install the native app on a physical iPhone without using a cloud build:

1. Clone or pull this repository onto your Mac (the native iOS build must run on macOS with Xcode installed).
2. Open the project folder in Terminal and run:

```bash
npm install
npx expo install --fix
npx expo prebuild --platform ios --clean
npx expo run:ios --device
```

3. Select your iPhone, trust the Mac if prompted, enable Developer Mode on the iPhone, and allow Xcode to sign the app with your Personal Team if you are not enrolled in the paid Apple Developer Program.
4. Once installed, run Metro from the project folder:

```bash
npx expo start --dev-client --lan --clear
```

Open the installed Fitlog development app on the iPhone and connect to that development server. Keep the Mac and iPhone on the same Wi-Fi network. If local networking is unreliable, use a tunnel supported by Expo CLI.

A local Xcode build is the practical path for device testing without a paid Apple Developer membership. EAS cloud builds for physical iPhones require Apple signing credentials. A free Personal Team development install is for development/testing and must be refreshed when its provisioning expires. The project has a separate EAS development profile if a cloud build is used later.

Whenever the Swift module, podspec, module config, or app configuration changes, regenerate native projects and rebuild the iOS app. Ordinary TypeScript/UI changes can continue to use Metro without rebuilding the native app.

## iPhone Motion Engine and movement metrics

Fitlog uses Apple's Core Motion pedometer on a native development build, with Expo Sensors as a fallback in Expo Go.

- Apple's `CMPedometer` provides system-generated steps, estimated distance, floors ascended/descended, pace and cadence when supported by the device. The module checks capability flags before displaying these readings.
- Pedometer callbacks pause while the app is suspended. Fitlog queries today's accumulated data again when the app returns to the foreground.
- The iPhone's floor counter is Apple's approximate floor count, not a precise architectural floor measurement. It can be unavailable on devices that do not support floor counting.
- The step-derived distance fallback in Expo Go is a rough estimate from profile height and average stride. It does not distinguish walking from running.
- Active calories in the daily Move card are an estimate made from remaining daily steps plus logged workout sessions. Steps attributed to a motion session are subtracted from the step component to reduce double counting. For manual walking/running sessions, the subtraction uses a typical cadence estimate. A full-day active-calorie value saved from another trusted source takes precedence.
- Workout calorie estimates use activity-category MET assumptions and profile weight. They are approximate and are not measured by the iPhone.
- Resting energy is a population-level BMR estimate prorated through the current day. It is not measured by the iPhone.
- DeviceMotion samples are collected only during a session the user explicitly starts. Fitlog stores the session summary (duration, steps, cadence, sample count and RMS signal), not the raw sensor stream. The RMS signal is experimental and depends on phone placement; it is not a validated exercise-intensity classification or calorie estimate.
- Motion sensors do not provide heart rate, sleep stages or menstrual-flow records. Those require separate sources or manual logging.

Apple documentation: [CMPedometer](https://developer.apple.com/documentation/coremotion/cmpedometer) · [CMPedometerData](https://developer.apple.com/documentation/coremotion/cmpedometerdata) · [Expo local modules](https://docs.expo.dev/modules/get-started/) · [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/).

## Food estimate catalogue

The current offline catalogue contains a small starter selection of common foods. Values are indicative estimates per 100 g with suggested household portions; actual nutrition varies with recipe, oil, brand, cooking method and serving size. This is not a complete import of the official Indian Food Composition Tables. The National Institute of Nutrition / ICMR publishes the [Indian Food Composition Tables](https://www.nin.res.in/ebooks/IFCT2017.pdf), which are a reference for future expansion. Users should check package labels or weigh portions when more precision is needed.

## Data and privacy

This MVP stores profile information, logs, pedometer totals and session summaries locally on the device using AsyncStorage. Raw motion samples are not persisted. There is no account, cloud sync, external analytics or server API configured. App removal or clearing its data can delete local entries. AsyncStorage is not an encrypted health-data vault; do not store highly sensitive medical details in this prototype.

## Not implemented yet

- AI food photo recognition and verified nutrition database lookup.
- Validated walking/running/workout classification from raw sensor data.
- Background sensor sampling or always-on workout detection.
- Automatic sleep, heart-rate or menstrual-cycle capture.
- Hevy integration.
- Cloud account, backend sync, export / restore and multi-device support.
- AI Coach Mode.
- Production signing, TestFlight and App Store release.

## Nutrition and safety

Energy and macro calculations are estimates, not medical advice or a diagnosis. Workout-energy estimates are approximate activity calculations, not measured total daily active energy or targets. Fitlog withholds calorie / macro prescriptions for under-18 users or selected health-review flags. Seek qualified guidance for personal medical or nutrition needs.
