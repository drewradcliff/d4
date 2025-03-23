import clsx from "clsx";
import { Href, usePathname } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { forwardRef } from "react";
import { Pressable, Text, View } from "react-native";

import TabBackground from "@/assets/tab-background.svg";
import { Icon } from "@/components/icon";
import { Paper } from "@/components/paper";
import { theme } from "@/tailwind.config";

type TabDetails = {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
};

const routeMap = new Map<Href, TabDetails>([
  ["/", { icon: "inbox", title: "inbox" }],
  ["/prioritize", { icon: "bolt", title: "prioritize" }],
  ["/tasks", { icon: "list", title: "tasks" }],
]);

export default function TabsLayout() {
  const pathname = usePathname();

  return (
    <Tabs asChild>
      <View className="py-safe-or-4 flex-1 bg-background">
        <View className="flex-1">
          <Text className="px-4 pt-4 font-lexend-bold text-5xl capitalize text-primary">
            {routeMap.get(pathname as Href)?.title}
          </Text>
          <TabSlot />
        </View>
        <TabList asChild>
          <Paper className="mx-4 rounded-full p-4" elevation={8}>
            {Array.from(routeMap.entries()).map(([href, { icon, title }]) => (
              <TabTrigger asChild href={href} key={title} name={title}>
                <TabButton icon={icon} title={title} />
              </TabTrigger>
            ))}
          </Paper>
        </TabList>
      </View>
    </Tabs>
  );
}

const TabButton = forwardRef<View, TabTriggerSlotProps & TabDetails>(
  ({ className, icon, isFocused, title, ...props }, ref) => (
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
        <Icon color={theme.colors.primary} name={icon} size={18} />
        <Text className="font-lexend-medium text-primary">{title}</Text>
      </View>
    </Pressable>
  ),
);
