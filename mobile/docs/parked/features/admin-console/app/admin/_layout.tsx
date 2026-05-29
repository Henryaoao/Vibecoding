import { Stack } from "expo-router";
import { RequireRole } from "@/auth/guards";

export default function AdminLayout() {
  return (
    <RequireRole roles={["super_user"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </RequireRole>
  );
}
