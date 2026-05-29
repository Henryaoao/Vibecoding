import { Redirect } from "expo-router";
import { LoadingState } from "@/components/StateViews";
import { useAuth } from "@/auth/AuthProvider";

export default function IndexRoute() {
  const { user, isRestoring } = useAuth();

  if (isRestoring) {
    return <LoadingState label="正在进入 ProjectM..." />;
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
