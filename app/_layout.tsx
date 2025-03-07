import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  PublicSans_200ExtraLight,
  PublicSans_300Light,
  PublicSans_700Bold,
} from "@expo-google-fonts/public-sans";
import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { colors } from "@/constants/colors";
import "react-native-reanimated";
import "@/styles/global.css";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";

export const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    card: colors.background,
    text: colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PublicSans_200ExtraLight,
    PublicSans_300Light,
    PublicSans_700Bold,
    ...FontAwesome.font,
  });

  const migrationsQuery = useQuery(
    {
      queryKey: ["migrations"],
      queryFn: async () => {
        await migrate(db, migrations);
        return true;
      },
      gcTime: 0, // forget result after unmount
      staleTime: Infinity, // don't refetch automatically
      retry: false, // fail fast
    },
    queryClient,
  );

  const isLoading = !loaded || migrationsQuery.isLoading;

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (migrationsQuery.isError) {
    alert(`Failed to migrate database\n${migrationsQuery.error.message}`);
  }

  if (isLoading) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ThemeProvider value={LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
