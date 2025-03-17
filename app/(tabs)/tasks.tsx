import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import { Pressable, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/header";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header heading="Tasks">
        <View className="flex-row items-center gap-3">
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
      </Header>
      <View className="m-6 mt-0 border border-primary">
        <FlatList
          keyExtractor={(task) => task.id.toString()}
          data={data}
          className="px-3 py-5"
          contentContainerClassName="gap-4"
          renderItem={({ item }) => <TaskItem task={item} />}
        />
      </View>
    </SafeAreaView>
  );
}
