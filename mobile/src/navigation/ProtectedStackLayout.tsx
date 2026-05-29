import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { RequireAuth } from "@/auth/guards";

type ProtectedStackLayoutProps = {
  children?: ReactNode;
};

export function ProtectedStackLayout({ children }: ProtectedStackLayoutProps) {
  return (
    <RequireAuth>
      {children ?? <Stack screenOptions={{ headerShown: false }} />}
    </RequireAuth>
  );
}
