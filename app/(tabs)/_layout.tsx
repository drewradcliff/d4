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

import { ShadowView } from "@/components/shadow-view";
import { TabBackgroundSvg } from "@/components/tab-background-svg";
import { theme } from "@/styles/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <ShadowView
          className="mx-3 rounded-full bg-background px-10 py-6"
          style={{
            marginBottom: insets.bottom,
            shadowOffset: { width: 2, height: 2 },
          }}
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
        </ShadowView>
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
