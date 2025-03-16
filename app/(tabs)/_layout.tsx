import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { ComponentProps, forwardRef } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TabBackground from "@/assets/tab-background.svg";
import { Paper } from "@/components/paper";
import { theme } from "@/styles/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <Paper
          className="mx-2 rounded-full p-2"
          elevation={2}
          style={{ marginBottom: Platform.OS === "ios" ? insets.bottom : 8 }}
        >
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="inbox">Inbox</TabButton>
          </TabTrigger>
          <TabTrigger name="prioritize" href="/prioritize" asChild>
            <TabButton icon="zap">Prioritize</TabButton>
          </TabTrigger>
          <TabTrigger name="tasks" href="/tasks" asChild>
            <TabButton icon="list">Tasks</TabButton>
          </TabTrigger>
        </Paper>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = Omit<TabTriggerSlotProps, "children"> & {
  children: string;
  icon: ComponentProps<typeof Feather>["name"];
};

const TabButton = forwardRef<View, TabButtonProps>(
  ({ children, className, icon, isFocused, ...props }, ref) => (
    <Pressable
      className={clsx("items-center justify-center", className)}
      hitSlop={4}
      ref={ref}
      {...props}
    >
      <View className={isFocused ? "visible" : "invisible"}>
        <TabBackground />
      </View>
      <View className="absolute w-full flex-row items-center justify-center gap-2">
        <Feather color={theme.colors.primary} name={icon} size={18} />
        <Text className="font-public-sans-regular text-secondary">
          {children}
        </Text>
      </View>
    </Pressable>
  ),
);
