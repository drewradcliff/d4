import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { db, expo } from "@/db/client";
import migrations from "@/db/drizzle/migrations";
import { theme } from "@/tailwind.config";

import "react-native-reanimated";
import "@/styles/global.css";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    card: theme.colors.background,
    text: theme.colors.primary,
  },
};

export default function RootLayout() {
  const { error, success } = useMigrations(db, migrations);

  useDrizzleStudio(expo);

  useEffect(() => {
    if (error) throw error; // handled by error boundary
    SplashScreen.hideAsync();
  }, [error]);

  if (!success) return null;

  return (
    <ThemeProvider value={LightTheme}>
      <SystemBars style="dark" />
      <GestureHandlerRootView>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
