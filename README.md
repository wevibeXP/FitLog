# Fitlog

Fitlog is an iOS-first personal wellness tracker built with Expo and React Native. The visual direction is soft pastel, warm, and deliberately non-clinical.

## Current MVP

- Six-step onboarding and a provisional energy / macro assessment.
- Today dashboard with daily calorie and macro totals, steps walked and active calories.
- Daily steps and active-calorie entries can be copied from Apple Fitness and entered manually; automatic HealthKit sync is not connected yet.
- Searchable starter food catalogue (including common South Indian and Indian foods) with automatic portion-based calories, protein, carbs and fat estimates.
- Multi-ingredient meal builder so a meal such as eggs + toast can be totalled together.
- Optional manual nutrition fallback for foods and homemade recipes not yet in the catalogue.
- Movement log for strength, Pilates, walking, running, cycling and mobility.
- Water intake quick logging.
- Progress check-ins for weight, bust, underbust, waist, lower abdomen, hips, glutes, left/right thighs, upper arms, forearms, calves, neck and sleep.
- Measurement history saved as dated snapshots, with cm or inch input (stored consistently in cm).
- Local persistence on the iPhone using AsyncStorage.
- iOS-only Expo configuration.

## Run in Expo Go

Requirements: Node.js 22.13+ and the current Expo Go app on iOS.

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npx tsc --noEmit
npx expo start --tunnel --clear
```

Scan the QR code with the iPhone camera and open it in Expo Go. Keep the Codespace running while testing.

## Food estimate catalogue

The current offline catalogue contains a small starter selection of common foods. Values are indicative estimates per 100 g with suggested household portions; actual nutrition varies with recipe, oil, brand, cooking method and serving size. This is not a complete import of the official Indian Food Composition Tables. The National Institute of Nutrition / ICMR publishes the [Indian Food Composition Tables](https://www.nin.res.in/ebooks/IFCT2017.pdf), which are a reference for future expansion. Users should check package labels or weigh portions when more precision is needed.

## Data and privacy

This MVP stores profile information and logs locally on the device using AsyncStorage. There is no account, cloud sync, external analytics or server API configured. App removal or clearing its data can delete local entries. AsyncStorage is not an encrypted health-data vault; do not store highly sensitive medical details in this prototype.

## Not implemented yet

- AI food photo recognition and verified nutrition database lookup.
- Apple Health / HealthKit permissions and imports.
- Hevy integration.
- Cloud account, backend sync, export / restore and multi-device support.
- AI Coach Mode.
- Production signing, TestFlight and App Store release.

## Nutrition and safety

Energy and macro calculations are estimates, not medical advice or a diagnosis. Users can manually edit logs. The app does not calculate or award exercise calories, and it withholds calorie / macro prescriptions for under-18 users or selected health-review flags. Seek qualified guidance for personal medical or nutrition needs.
