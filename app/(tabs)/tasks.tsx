import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ShadowView } from "@/components/shadow-view";
import clsx from "clsx";

const tabs = ["do", "decide", "delegate", "delete"] as const;

export default function TasksScreen() {
  const [selected, setSelected] = useState<(typeof tabs)[number]>("do");

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <StatusBar style="dark" />
      <Text className="text-4xl font-public-sans-bold text-primary">Tasks</Text>
      <View className="flex-row items-center gap-3 pt-5">
        {tabs.map((tab) => (
          <Pressable key={tab} onPress={() => setSelected(tab)}>
            {({ pressed }) => (
              <ShadowView
                className={clsx(
                  "px-3 p-2 justify-center items-center",
                  selected === tab && `bg-${tab}`
                )}
                style={{
                  shadowOffset: {
                    height: pressed ? 0 : 2,
                    width: pressed ? 0 : 2,
                  },
                  transform: [
                    { translateX: pressed ? 2 : 0 },
                    { translateY: pressed ? 2 : 0 },
                  ],
                }}
              >
                <Text
                  className={clsx(
                    "text-primary font-public-sans-extra-light text-sm",
                    selected === tab && "font-public-sans-bold"
                  )}
                >
                  {tab.toUpperCase()}
                </Text>
              </ShadowView>
            )}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
