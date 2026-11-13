# Fitlog

Fitlog is an iOS-first personal wellness tracker built with Expo and React Native. The visual direction is soft pastel, warm, and deliberately non-clinical.

## Current MVP

- Six-step onboarding and a provisional energy / macro assessment.
- Today dashboard with daily calorie and macro totals, steps walked and active calories.
- Read-only Apple Health integration for steps, active energy, workouts, sleep and recorded menstrual-flow history, including best-effort background delivery and a manual Sync Now action.
- Searchable starter food catalogue (including common South Indian and Indian foods) with automatic portion-based calories, protein, carbs and fat estimates.
- Multi-ingredient meal builder so a meal such as eggs + toast can be totalled together.
- Optional manual nutrition fallback for foods and homemade recipes not yet in the catalogue.
- Movement log for strength, Pilates, walking, running, cycling and mobility.
- Water intake quick logging.
- Progress check-ins for weight, bust, underbust, waist, lower abdomen, hips, glutes, left/right thighs, upper arms, forearms, calves, neck, sleep and Apple Health cycle history.
- Measurement history saved as dated snapshots, with cm or inch input (stored consistently in cm).
- Local persistence on the iPhone using AsyncStorage.
- iOS-only Expo configuration.

## Run the iOS development build

HealthKit is native iOS code and cannot run inside Expo Go. Fitlog uses an Expo development build.

Requirements:
- Node.js 22.13+
- Expo account
- Apple Developer Program membership for installing a cloud-built iOS app on a physical iPhone
- HealthKit capability enabled for bundle identifier `com.wevibexp.fitlog`

Install and validate:

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npx tsc --noEmit
npx eas-cli login
npx eas-cli build --platform ios --profile development
```

When EAS asks, allow it to configure iOS signing credentials for your Apple Developer account. Install the development build from the EAS build link on the iPhone. Then start Metro using:

```bash
npx expo start --dev-client --tunnel
```

Open the installed Fitlog development app and connect to the development server.

## Apple Health permissions and sync

Fitlog requests read access only for steps, active energy, workouts, sleep and menstrual-flow records. It does not write to Apple Health. The cycle view derives historical cycle starts from HealthKit's recorded start-of-cycle metadata and calculates averages only from actual recorded start dates; it does not produce period, ovulation or fertility predictions. iOS intentionally does not tell apps whether a read permission was granted; an empty result may mean no samples were shared or access was not allowed. Review access in the Health app under your profile and Apps and Services.

Foreground sync is available from the Today dashboard. The app also registers best-effort HealthKit background delivery. iOS controls delivery timing; steps and active energy updates are generally delivered no more than hourly. Open Fitlog and use Sync Now when you need a fresh reading.

Health data is stored in this prototype's local app storage only; there is no Fitlog cloud upload or account sync. AsyncStorage is not encrypted health-data storage.

## Food estimate catalogue

The current offline catalogue contains a small starter selection of common foods. Values are indicative estimates per 100 g with suggested household portions; actual nutrition varies with recipe, oil, brand, cooking method and serving size. This is not a complete import of the official Indian Food Composition Tables. The National Institute of Nutrition / ICMR publishes the [Indian Food Composition Tables](https://www.nin.res.in/ebooks/IFCT2017.pdf), which are a reference for future expansion. Users should check package labels or weigh portions when more precision is needed.

## Data and privacy

This MVP stores profile information, logs and imported cycle history locally on the device using AsyncStorage. There is no account, cloud sync, external analytics or server API configured. App removal or clearing its data can delete local entries. AsyncStorage is not an encrypted health-data vault; do not store highly sensitive medical details in this prototype.

## Not implemented yet

- AI food photo recognition and verified nutrition database lookup.

- Hevy integration.
- Cloud account, backend sync, export / restore and multi-device support.
- AI Coach Mode.
- Production signing, TestFlight and App Store release.

## Nutrition and safety

Energy and macro calculations are estimates, not medical advice or a diagnosis. Users can manually edit logs. The app does not calculate or award exercise calories, and it withholds calorie / macro prescriptions for under-18 users or selected health-review flags. Seek qualified guidance for personal medical or nutrition needs.
