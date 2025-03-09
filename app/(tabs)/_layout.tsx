import { Feather } from "@expo/vector-icons";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { ComponentProps, forwardRef, Ref } from "react";
import { Pressable, Text, TextProps, View } from "react-native";

import { ShadowView } from "@/components/shadow-view";
import { TabBackgroundSvg } from "@/components/tab-background-svg";
import { colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs className="bg-background pb-10">
      <TabSlot />
      <TabList asChild>
        <ShadowView
          style={{ shadowOffset: { width: 2, height: 2 } }}
          className="mx-3 px-10 py-6"
        >
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="inbox">Inbox</TabButton>
          </TabTrigger>
          <TabTrigger
            className="flex-row items-center gap-2"
            name="prioritize"
            href="/prioritize"
            asChild
          >
            <TabButton icon="zap">Prioritize</TabButton>
          </TabTrigger>
          <TabTrigger
            className="flex-row items-center gap-2"
            name="tasks"
            href="/tasks"
            asChild
          >
            <TabButton icon="list">Tasks</TabButton>
          </TabTrigger>
        </ShadowView>
      </TabList>
    </Tabs>
  );
}

type Icon = ComponentProps<typeof Feather>["name"];

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: Icon;
  children: TextProps["children"];
};

const TabButton = forwardRef(
  ({ icon, children, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        className="relative flex-row items-center gap-2"
      >
        {isFocused && (
          <View className="absolute -left-8">
            <TabBackgroundSvg />
          </View>
        )}
        {icon && <Feather color={colors.primary} name={icon} size={18} />}
        <Text className="font-public-sans-regular text-secondary">
          {children}
        </Text>
      </Pressable>
    );
  },
);
