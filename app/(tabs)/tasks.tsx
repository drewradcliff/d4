import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { eq } from "drizzle-orm";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShadowView } from "@/components/shadow-view";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { queryClient } from "@/app/_layout";

const tabs = new Map([
  ["do", "bg-do"],
  ["decide", "bg-decide"],
  ["delegate", "bg-delegate"],
  ["delete", "bg-delete"],
] as const);

export default function TasksScreen() {
  const [selected, setSelected] = useState<
    "do" | "decide" | "delegate" | "delete"
  >("do");

  const { data } = useQuery({
    queryKey: ["tasks-priority", selected],
    queryFn: async () =>
      await db.select().from(tasks).where(eq(tasks.priority, selected)),
  });
  const { mutate: toggleTask } = useMutation({
    mutationFn: async ({
      id,
      completedAt,
    }: {
      id: number;
      completedAt: string | null;
    }) => {
      await db
        .update(tasks)
        .set({ completedAt: completedAt ?? null })
        .where(eq(tasks.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-priority"] });
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <StatusBar style="dark" />
      <Text className="text-4xl font-public-sans-bold text-primary">Tasks</Text>
      <View className="flex-row items-center gap-3 pt-5">
        {Array.from(tabs.entries()).map(([tab, className]) => (
          <Pressable key={tab} onPress={() => setSelected(tab)}>
            {({ pressed }) => (
              <ShadowView
                className={clsx(
                  "px-3 p-2 justify-center items-center",
                  selected === tab && className
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
      <View className="border border-primary mt-6">
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={data}
          className="px-3 py-5"
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  toggleTask({
                    id: item.id,
                    completedAt: item.completedAt
                      ? null
                      : new Date().toISOString(),
                  });
                }}
              >
                <ShadowView className="w-4 h-4 justify-center items-center">
                  {item.completedAt && (
                    <Feather name="check" size={12} color={colors.primary} />
                  )}
                </ShadowView>
              </Pressable>
              <Text
                className={clsx(
                  "text-primary font-public-sans-light",
                  item.completedAt && "line-through"
                )}
              >
                {item.description}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
