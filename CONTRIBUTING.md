# Contributing to Weather Agent

Welcome to the Weather Agent team! We are a 100% JavaScript shop. This guide ensures your local environment matches production, preventing "it works on my machine" issues.

## 🚨 Golden Rules

1.  **Strict Node Version**: You MUST use the Node version defined in `.nvmrc`.
2.  **Strict Package Manager**: You MUST use `pnpm`. `npm` and `yarn` will fail.
3.  **Strict Lockfiles**: Never delete `pnpm-lock.yaml`.

## 🛠️ Setup: The "Protocol"

### 1. Unified Prerequisite (Do this first)

Ensure you are using the correct Node version.

```bash
# In the root of the repo
nvm use
# If you don't have it: nvm install
```

Enable corepack for pnpm:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

---

### 2. Mobile Development (`apps/mobile`)

We do NOT use Docker for mobile development (because Simulator requires macOS/Xcode). Instead, we use **Strict Versioning**.

**To Start the App:**

```bash
# Option A (Recommended): From the root
pnpm mobile:dev      # Starts Metro Bundler
pnpm mobile:ios      # Opens in iOS Simulator
pnpm mobile:android  # Opens in Android Emulator

# Option B: From the directory
cd apps/mobile
pnpm start
```

_Note: This will launch Expo. Press `i` to open in iOS Simulator._

**Troubleshooting:**

- **"Missing Module"**: Run `pnpm install` in the ROOT, not inside `apps/mobile/node_modules`.
- **"CocoaPods Error"**: `cd apps/mobile && npx expo run:ios` (This rebuilds the native binary).

---

### 3. Web/Backend Development

We use **Docker** for backend services to emulate our production cloud environment.

**To Start the Stack:**

```bash
# From the root
pnpm dev:up
```

This spins up:

- PostgreSQL
- Redis
- Backend API
- Web Dashboard

**To Stop:**

```bash
pnpm dev:down
```

---

## 🚀 Deployment (EAS)

We use **Expo Application Services (EAS)** for building our production mobile binaries. This is our "CI/CD" for mobile.

**To Build for Production:**

```bash
cd apps/mobile
eas build --profile production
```

_Never build a release binary locally on your machine._
