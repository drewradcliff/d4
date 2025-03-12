import {
  PublicSans_200ExtraLight,
  PublicSans_300Light,
  PublicSans_400Regular,
  PublicSans_700Bold,
} from "@expo-google-fonts/public-sans";
import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { db } from "@/db/client";
import migrations from "@/db/drizzle/migrations";
import { theme } from "@/styles/theme";

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
  const migrationsResult = useMigrations(db, migrations);
  const [fontsLoaded, fontsError] = useFonts({
    PublicSans_200ExtraLight,
    PublicSans_300Light,
    PublicSans_400Regular,
    PublicSans_700Bold,
  });

  const error = migrationsResult.error || fontsError;
  const isLoading = !migrationsResult.success || !fontsLoaded;

  useEffect(() => {
    if (error) throw error; // handled by error boundary
    if (isLoading) return;
    SplashScreen.hideAsync();
  }, [isLoading, error]);

  if (isLoading) return null;

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
