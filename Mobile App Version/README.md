# Apna Fashion Mart — Flutter Mobile App

Hyperlocal fashion marketplace connecting shoppers with nearby boutiques.
Discover ethnic wear, sarees, suits, and more from curated local stores.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Flutter SDK | 3.19.x |
| Dart SDK | 3.3.x (bundled with Flutter) |
| Android Studio | Hedgehog (2023.1.1) or newer |
| Xcode | 15+ (macOS only, required for iOS builds) |
| CocoaPods | 1.14+ (macOS only) |
| Node.js | 18+ (only if running Supabase Edge Functions locally) |

---

## Getting Started

### 1. Install dependencies

```bash
flutter pub get
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `GOOGLE_MAPS_API_KEY` | Google Maps / Places API key |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `SENTRY_DSN` | *(optional)* Sentry DSN for error monitoring |

### 3. Run the app

```bash
# With hot reload (development)
flutter run \
  --dart-define=SUPABASE_URL=https://xxxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your_anon_key \
  --dart-define=GOOGLE_MAPS_API_KEY=your_maps_key \
  --dart-define=RAZORPAY_KEY_ID=rzp_test_xxxx

# Or use a launch configuration in VS Code / Android Studio
# (see .vscode/launch.json if present)
```

---

## Building for Release

### Android APK

```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=GOOGLE_MAPS_API_KEY=... \
  --dart-define=RAZORPAY_KEY_ID=...
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (recommended for Play Store)

```bash
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=GOOGLE_MAPS_API_KEY=... \
  --dart-define=RAZORPAY_KEY_ID=...
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (macOS + Xcode required)

```bash
# Install pods first
cd ios && pod install && cd ..

# Build IPA
flutter build ipa --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=GOOGLE_MAPS_API_KEY=... \
  --dart-define=RAZORPAY_KEY_ID=...
```

> **Note:** iOS builds require a Mac with Xcode 15+, a valid Apple Developer account,
> and signing certificates configured in Xcode.

---

## Architecture Overview

The app uses a clean, feature-first architecture:

| Layer | Technology |
|-------|-----------|
| State management | **Riverpod** (`flutter_riverpod`) |
| Navigation | **GoRouter** — declarative, deep-link-aware routing |
| Backend | **Supabase** — auth, database (PostgreSQL), storage, realtime |
| Payments | **Razorpay** Flutter SDK |
| Maps | **Google Maps Flutter** + `geolocator` |
| Notifications | **Firebase Cloud Messaging** (FCM) |
| Error monitoring | **Sentry** Flutter SDK |

---

## Folder Structure

```
lib/
├── core/
│   ├── constants/      # App-wide constants (table names, keys, etc.)
│   ├── providers/      # Riverpod providers (auth, cart, wishlist, …)
│   ├── services/       # Supabase, auth, Razorpay, AI chatbot services
│   └── theme/          # AppColors, AppTheme, text styles
│
├── features/
│   ├── account/        # Account, orders, returns, notifications, profile
│   ├── cart/           # Cart screen & provider
│   ├── home/           # Home feed, banners, categories
│   ├── nearby/         # Map-based nearby boutique discovery
│   ├── product/        # Product detail & reviews
│   ├── search/         # Search + filters
│   └── wishlist/       # Wishlist screen
│
└── main.dart           # App entry point, Supabase init, routing
```

---

## Environment Variables Reference

All variables are injected at build time via `--dart-define`. They are
**never** bundled as plain text in the binary — access them in code with:

```dart
const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
```

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | Yes | Project URL from Supabase dashboard |
| `SUPABASE_ANON_KEY` | Yes | Safe to expose in client apps |
| `GOOGLE_MAPS_API_KEY` | Yes | Enable Maps SDK + Places API in GCP console |
| `RAZORPAY_KEY_ID` | Yes | Use `rzp_test_*` for development |
| `SENTRY_DSN` | No | Leave blank to disable Sentry |

---

## Connecting to the Same Backend as the Web App

The Flutter app shares the same Supabase project as the Next.js web app.
Use identical `SUPABASE_URL` and `SUPABASE_ANON_KEY` values.

Row Level Security (RLS) policies in Supabase ensure each user can only
access their own data regardless of which client they use.

---

## Useful Commands

```bash
# Check Flutter environment
flutter doctor -v

# Run all tests
flutter test

# Analyse code for warnings/errors
flutter analyze

# Format code
dart format lib/

# Clean build artifacts
flutter clean && flutter pub get
```

---

## Contributing

1. Create a feature branch from `main`.
2. Follow the existing folder structure and naming conventions.
3. Run `flutter analyze` and `flutter test` before opening a PR.
4. Keep secrets out of committed code — use `--dart-define` or CI secrets.
