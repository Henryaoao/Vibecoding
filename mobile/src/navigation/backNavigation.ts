import { router } from "expo-router";

export function goBackOrHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/(tabs)");
}

export function goBackOrDocuments() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/(tabs)/documents");
}

export function goBackOrProfile() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/(tabs)/me");
}

export function goBackOrTraining() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/(tabs)/training");
}
