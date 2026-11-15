# Fitlog

Fitlog is an iOS-first personal wellness tracker built with Expo and React Native. The visual direction is soft pastel, warm, and deliberately non-clinical.

## Current MVP

- Six-step onboarding and a provisional energy / macro assessment.
- Today dashboard with daily food totals, macro progress, iPhone pedometer steps and optional externally sourced active calories.
- Move dashboard with detailed daily movement metrics, live iPhone step counts, session logging and movement history.
- Step-based distance estimate, BMR-based resting-energy estimate and approximate workout energy from logged activity duration.
- iPhone Motion Engine using Expo Sensors: daily step totals from Core Motion and user-started live movement sessions using DeviceMotion.
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

Scan the QR code with the iPhone Camera and open the project in Expo Go. Keep the Codespace running while testing. The iPhone must be carried for the pedometer to count its steps.

## iPhone Motion Engine and movement metrics

Fitlog uses `expo-sensors`, which is included in Expo Go for iOS.

- The iPhone pedometer reads system-counted steps and can query up to the previous seven days.
- Live pedometer callbacks pause while Fitlog is backgrounded. Fitlog re-queries the iPhone's step history when you return to the app.
- DeviceMotion samples are collected only during a session the user explicitly starts. Fitlog stores the session summary (duration, steps, cadence, sample count and RMS signal), not the raw sensor stream.
- The RMS signal is experimental and depends on phone placement. It is not a validated exercise-intensity classification or calorie estimate.
- The Move dashboard's step-based distance is a rough estimate from profile height and an average walking stride. It cannot distinguish walking from running and is not a GPS or native pedometer distance reading.
- Resting energy is a population-level BMR estimate prorated through the current day. It is not measured by the iPhone.
- Workout calories are approximate estimates from logged activity category, duration and profile weight. When a daily active-calorie value is entered from another trusted source, that value takes precedence. The app does not infer whole-day active energy from steps or acceleration.
- The current Expo Go Pedometer wrapper exposes step counts only. Floors climbed and live walking/running pace require the additional native iOS Core Motion readings and a development build; they are shown as unavailable rather than guessed.
- Motion sensors cannot provide heart rate, sleep stages or menstrual-flow records. Those require separate sources (for example, a native HealthKit integration) or manual logging.

The pedometer API's seven-day history and foreground-only live callback behavior follow the Expo SDK 58 documentation. [Expo Pedometer](https://docs.expo.dev/versions/v58.0.0/sdk/pedometer/) · [Expo Sensors](https://docs.expo.dev/versions/v58.0.0/sdk/sensors/).

## Food estimate catalogue

The current offline catalogue contains a small starter selection of common foods. Values are indicative estimates per 100 g with suggested household portions; actual nutrition varies with recipe, oil, brand, cooking method and serving size. This is not a complete import of the official Indian Food Composition Tables. The National Institute of Nutrition / ICMR publishes the [Indian Food Composition Tables](https://www.nin.res.in/ebooks/IFCT2017.pdf), which are a reference for future expansion. Users should check package labels or weigh portions when more precision is needed.

## Data and privacy

This MVP stores profile information, logs, pedometer totals and session summaries locally on the device using AsyncStorage. Raw motion samples are not persisted. There is no account, cloud sync, external analytics or server API configured. App removal or clearing its data can delete local entries. AsyncStorage is not an encrypted health-data vault; do not store highly sensitive medical details in this prototype.

## Not implemented yet

- Native Core Motion integration for floors climbed and live walking/running pace.
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
