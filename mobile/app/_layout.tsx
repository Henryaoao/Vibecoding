import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/AuthProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { queryClient } from "@/query/client";
import { rootStackScreenOptions } from "@/navigation/transitions";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={rootStackScreenOptions.auth} />
            <Stack.Screen name="(tabs)" options={rootStackScreenOptions.tabs} />
            <Stack.Screen name="modules" />
            <Stack.Screen name="announcements/[id]" />
            <Stack.Screen name="briefs/[id]" />
            <Stack.Screen name="forum-hot/[id]" />
            <Stack.Screen name="newcomer/[id]" />
            <Stack.Screen name="finance/[id]" />
            <Stack.Screen name="documents/[id]" />
            <Stack.Screen name="training/[id]" />
            <Stack.Screen name="me" options={rootStackScreenOptions.tabs} />
            <Stack.Screen name="forbidden" />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
