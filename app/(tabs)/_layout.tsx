import clsx from "clsx";
import { type Href, usePathname } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { createContext, forwardRef, useState } from "react";
import { Pressable, Text, View, type ViewProps } from "react-native";

import TabBackground from "@/assets/tab-background.svg";
import { Icon } from "@/components/icon";
import { Paper } from "@/components/paper";
import { theme } from "@/tailwind.config";

export default function TabsLayout() {
  const [tabBarHeight, setTabBarHeight] = useState(0);

  return (
    <TabBarHeightContext.Provider value={tabBarHeight}>
      <Tabs asChild>
        <TabSlot />
        <TabList asChild>
          <Paper
            className="bottom-safe absolute left-4 right-4 rounded-full p-4"
            elevation={8}
            onLayout={({ nativeEvent }) => {
              setTabBarHeight(nativeEvent.layout.height);
            }}
          >
            {Array.from(routeMap.entries()).map(([href, { icon, title }]) => (
              <TabTrigger asChild href={href} key={title} name={title}>
                <TabButton icon={icon} title={title} />
              </TabTrigger>
            ))}
          </Paper>
        </TabList>
      </Tabs>
    </TabBarHeightContext.Provider>
  );
}

export function TabView({ children, className, ...props }: ViewProps) {
  const pathname = usePathname();

  return (
    <View
      className={clsx("pt-safe flex-1 bg-background", className)}
      {...props}
    >
      <Text className="m-4 mb-0 font-lexend-bold text-lg capitalize text-primary">
        {routeMap.get(pathname as Href)?.title}
      </Text>
      {children}
    </View>
  );
}

export const TabBarHeightContext = createContext(0);

const TabButton = forwardRef<View, TabButtonProps & TabTriggerSlotProps>(
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
        <Text className="font-lexend-medium text-base text-primary">
          {title}
        </Text>
      </View>
    </Pressable>
  ),
);

const routeMap = new Map<Href, TabButtonProps>([
  ["/", { icon: "inbox", title: "inbox" }],
  ["/prioritize", { icon: "bolt", title: "prioritize" }],
  ["/tasks", { icon: "list", title: "tasks" }],
]);

type TabButtonProps = {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
};
