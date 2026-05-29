# ProjectM Mobile

React Native + Expo + TypeScript mobile app skeleton for ProjectM.

## Start

```bash
cd mobile
npm install
npm run start
```

## Current Scope

- Expo Router base routes
- Theme tokens and reusable UI primitives
- API client with envelope handling
- Mock transport with realistic `code` / `message` / `data` / `request_id`
- Auth provider with SecureStore-backed token storage
- Login, home, documents, training, profile, Admin guard, and 403 screens

真实后端未就绪前，`app.json` 中 `extra.apiBaseUrl` 保持为 `mock`。
