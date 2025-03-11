import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { queryClient } from "@/app/_layout";
import { ShadowView } from "@/components/shadow-view";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

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
      <Text className="font-public-sans-bold text-4xl text-primary">Tasks</Text>
      <View className="flex-row items-center gap-3 pt-5">
        {Array.from(tabs.entries()).map(([tab, className]) => (
          <Pressable key={tab} onPress={() => setSelected(tab)}>
            {({ pressed }) => (
              <ShadowView
                className={clsx(
                  "items-center justify-center rounded-full p-2 px-3",
                  selected === tab && className,
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
                    "font-public-sans-extra-light text-sm text-primary",
                    selected === tab && "font-public-sans-bold",
                  )}
                >
                  {tab.toUpperCase()}
                </Text>
              </ShadowView>
            )}
          </Pressable>
        ))}
      </View>
      <View className="mt-6 border border-primary">
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
                <ShadowView className="h-4 w-4 items-center justify-center rounded-full">
                  {item.completedAt && (
                    <Feather
                      name="check"
                      size={12}
                      color={theme.colors.primary}
                    />
                  )}
                </ShadowView>
              </Pressable>
              <Text
                className={clsx(
                  "font-public-sans-light text-primary",
                  item.completedAt && "line-through",
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
