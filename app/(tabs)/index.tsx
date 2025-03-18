import { Feather } from "@expo/vector-icons";
import { and, eq, gt, gte, isNull, lt, lte, sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/header";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { tasks, Task } from "@/db/schema";
import { theme } from "@/styles/theme";

const SCROLL_THRESHOLD = 50;

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const { data } = useLiveQuery(
    db.select().from(tasks).where(isNull(tasks.priority)).orderBy(tasks.order),
  );

  const addTask = async () => {
    if (!description.trim()) return;
    await db.insert(tasks).values({ description });
    setDescription("");
  };

  // Initial order:
  // task 1: 1
  // task 2: 2 <-- drag item
  // task 3: 3
  // task 4: 4

  // shift items up:
  // task 1: 1
  // ---
  // task 3: 2
  // task 4: 4

  // place dragged item:
  // task 1: 1
  // task 3: 2
  // task 2: 3 <-- new position
  // task 4: 4

  const reorderTasks = async ({
    task,
    newOrder,
  }: {
    task: Task;
    newOrder: number;
  }) => {
    if (task.order < newOrder) {
      await db
        .update(tasks)
        .set({
          order: sql`order - 1`,
        })
        .where(and(gt(tasks.order, task.order), lte(tasks.order, newOrder)));
    } else if (task.order > newOrder) {
      await db
        .update(tasks)
        .set({
          order: sql`order + 1`,
        })
        .where(and(gte(tasks.order, newOrder), lt(tasks.order, task.order)));
    }

    await db
      .update(tasks)
      .set({ order: newOrder })
      .where(eq(tasks.id, task.id));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header className="pb-0" heading="Inbox">
        <View className="flex-row items-center gap-2">
          <Paper className="flex-1 bg-white" elevation={2}>
            <TextInput
              className="p-3 font-public-sans-light text-xl leading-[0] text-primary"
              placeholder="Add task..."
              placeholderTextColor={theme.colors.secondary}
              value={description}
              onChangeText={setDescription}
              onSubmitEditing={addTask}
              submitBehavior="submit"
            />
          </Paper>
          <Pressable hitSlop={8} onPress={addTask}>
            {({ pressed }) => (
              <Paper
                className="size-12 items-center justify-center rounded-full"
                elevation={pressed ? 0 : 2}
                style={{
                  transform: [
                    { translateX: pressed ? 2 : 0 },
                    { translateY: pressed ? 2 : 0 },
                  ],
                }}
              >
                <Feather name="plus" size={20} color={theme.colors.primary} />
              </Paper>
            )}
          </Pressable>
        </View>
      </Header>

      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <DraggableFlatList
          contentContainerClassName="gap-4 p-6"
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ ...props }) => <TaskItem {...props} />}
          onDragEnd={async ({ data }) => {
            await Promise.all(
              data.map((item, index) =>
                db
                  .update(tasks)
                  .set({ order: index })
                  .where(eq(tasks.id, item.id)),
              ),
            );
          }}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < -SCROLL_THRESHOLD) {
              Keyboard.dismiss();
            }
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
