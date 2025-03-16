import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import { Pressable, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

const tabs = new Map([
  ["do", "bg-background-do"],
  ["decide", "bg-background-decide"],
  ["delegate", "bg-background-delegate"],
  ["delete", "bg-background-delete"],
] as const);

export default function TasksScreen() {
  const [selected, setSelected] = useState<NonNullable<Task["priority"]>>("do");

  const { data } = useLiveQuery(
    db.select().from(tasks).where(eq(tasks.priority, selected)),
    [selected],
  );

  const toggleTask = (task: Task) => async () => {
    await db
      .update(tasks)
      .set({ completedAt: task.completedAt ? null : new Date().toISOString() })
      .where(eq(tasks.id, task.id));
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-6" edges={["top"]}>
      <Text className="font-public-sans-bold text-4xl text-primary">Tasks</Text>
      <View className="flex-row items-center gap-3 pt-5">
        {Array.from(tabs.entries()).map(([priority, className]) => (
          <Pressable key={priority} onPress={() => setSelected(priority)}>
            {({ pressed }) => (
              <Paper
                className={clsx(
                  "items-center justify-center rounded-full p-2 px-3",
                  selected === priority && className,
                )}
                elevation={pressed ? 0 : 2}
                style={{
                  transform: [
                    { translateX: pressed ? 2 : 0 },
                    { translateY: pressed ? 2 : 0 },
                  ],
                }}
              >
                <Text className="font-public-sans-extra-light text-sm uppercase text-primary">
                  {priority}
                </Text>
              </Paper>
            )}
          </Pressable>
        ))}
      </View>
      <View className="mt-6 border border-primary">
        <FlatList
          keyExtractor={(task) => task.id.toString()}
          data={data}
          className="px-3 py-5"
          renderItem={({ item: task }) => (
            <View className="flex-row items-center gap-2">
              <Pressable onPress={toggleTask(task)}>
                <Paper className="h-4 w-4 items-center justify-center rounded-full">
                  {task.completedAt && (
                    <Feather
                      name="check"
                      size={12}
                      color={theme.colors.primary}
                    />
                  )}
                </Paper>
              </Pressable>
              <Text
                className={clsx(
                  "font-public-sans-light text-primary",
                  task.completedAt && "line-through",
                )}
              >
                {task.description}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
