# Fitlog

iOS-first personal fitness and nutrition tracking app, built with Expo and React Native.

## Current milestone

- Six-step personal onboarding flow.
- Initial BMR, TDEE, calorie and macro estimates with conservative planning guardrails.
- Dark interface designed for iPhone.
- iOS is the only configured platform.

This is an early prototype. User data is currently held in memory and resets when the app reloads. Authentication, persistent storage, Apple Health / HealthKit, Hevy, food recognition, and AI Coach Mode are not implemented yet.

## Run on an iPhone with Expo Go

1. Install **Node.js 22.13 or newer** on your development machine.
2. Install **Expo Go** from the iOS App Store.
3. Create or sign in to an Expo account.
4. In this repository, run:

   ```bash
   npm install
   npx expo install --fix
   npx expo-doctor
   npx expo login
   npx expo start --tunnel
   ```

5. Sign in to the same Expo account inside the Expo Go app on your iPhone.
6. Scan the QR code displayed by the Expo CLI using your iPhone camera, then open it in Expo Go.

If you use GitHub Codespaces, run the Expo command in the Codespaces terminal. Keep the Codespace running while testing.

## Next iOS milestones

1. Validate onboarding on a physical iPhone.
2. Add persistent local and cloud storage.
3. Add HealthKit through a custom development build.
4. Add food logging, workout tracking, and AI Coach Mode.
5. Prepare a production build and TestFlight distribution.

## Apple distribution

Expo Go is for development preview only. A custom development build is needed for native integrations such as HealthKit. Installing cloud-built development builds on a registered physical iPhone requires Apple signing credentials and an active Apple Developer Program membership. TestFlight and App Store distribution also require a paid Apple Developer Program membership.

## Safety note

Calorie and macro values are estimates, not medical advice. The assessment prototype withholds calorie and macro prescriptions for under-18 users and selected health review flags.
