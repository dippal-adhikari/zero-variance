# Zero Variance

Cross-platform (iOS + Android) till-counting app built with Expo + React Native.

## Run (Expo Go / simulator)

```bash
cd zero-variance
npm run start
```

- Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go**.

## Build an APK (permanent install on Android)

1. Install EAS CLI:

```bash
npm i -g eas-cli
```

2. Log in to Expo:

```bash
eas login
```

3. Configure the project (one-time):

```bash
cd zero-variance
eas build:configure
```

4. Build an **APK**:

```bash
eas build -p android --profile preview
```

When the build finishes, download the `.apk` from the Expo build link and install it on your phone.

