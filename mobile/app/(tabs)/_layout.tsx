import { Stack } from "expo-router";
import { RequireAuth } from "@/auth/guards";

export default function AppShellLayout() {
  return (
    <RequireAuth>
      <Stack screenOptions={{ headerShown: false }} />
    </RequireAuth>
  );
}
