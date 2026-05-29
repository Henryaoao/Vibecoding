import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "projectm.accessToken";
let memoryToken: string | null = null;

export async function getStoredAccessToken() {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    memoryToken = token;
    return token;
  } catch {
    return memoryToken;
  }
}

export async function saveAccessToken(token: string) {
  memoryToken = token;

  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
  } catch {
    // SecureStore can be unavailable in some test/web shells; memory keeps mock flows usable.
  }
}

export async function clearAccessToken() {
  memoryToken = null;

  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    // No-op fallback for test/web shells.
  }
}
