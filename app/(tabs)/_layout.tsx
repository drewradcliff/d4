import { Feather } from "@expo/vector-icons";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { ComponentProps, forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Paper } from "@/components/paper";
import { TabBackgroundSvg } from "@/components/tab-background-svg";
import { theme } from "@/styles/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <Paper
          className="mx-3 rounded-full px-10 py-6"
          elevation={2}
          style={{ marginBottom: insets.bottom }}
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

const TabButton = forwardRef<
  View,
  TabTriggerSlotProps & { icon: ComponentProps<typeof Feather>["name"] }
>(({ icon, children, isFocused, ...props }, ref) => (
  <Pressable className="flex-row items-center gap-2" ref={ref} {...props}>
    {isFocused && (
      <View className="absolute -left-8">
        <TabBackgroundSvg />
      </View>
    )}
    <Feather color={theme.colors.primary} name={icon} size={18} />
    <Text className="font-public-sans-regular text-secondary">{children}</Text>
  </Pressable>
));
