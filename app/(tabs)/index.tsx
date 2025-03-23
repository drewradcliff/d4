import { eq, isNull, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import { KeyboardAvoidingView, Pressable, TextInput } from "react-native";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { Icon } from "@/components/icon";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { theme } from "@/tailwind.config";

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const { data } = useLiveQuery(
    db
      .select()
      .from(tasks)
      .where(isNull(tasks.priority))
      .orderBy(tasks.position),
  );

  const addTask = async () => {
    if (!description.trim()) return;
    const [{ position }] = await db
      .select({ position: max(tasks.position) })
      .from(tasks)
      .where(isNull(tasks.priority))
      .limit(1);

    await db
      .insert(tasks)
      .values({ description, position: (position ?? 0) + 1 });
    setDescription("");
  };

  const reorderTasks = async ({ from, to }: ReorderableListReorderEvent) => {
    const items = reorderItems(data, from, to);
    await db.transaction(async (tx) => {
      await Promise.all(
        items.map((item, index) =>
          tx
            .update(tasks)
            .set({ position: index })
            .where(eq(tasks.id, item.id)),
        ),
      );
    });
  };

  return (
    <>
      <Paper
        className="mx-4 flex-row items-center rounded-md bg-white p-3"
        elevation={4}
      >
        <TextInput
          className="h-10 flex-1 font-lexend-medium text-xl leading-[0] text-primary"
          onChangeText={setDescription}
          onSubmitEditing={addTask}
          placeholder="what's your next move?"
          placeholderTextColor={theme.colors.secondary}
          submitBehavior="submit"
          value={description}
        />
        <Pressable onPress={addTask}>
          {({ pressed }) => (
            <Paper
              className="size-10 items-center justify-center rounded-md bg-purple"
              elevation={pressed ? 0 : 2}
              style={{
                transform: [
                  { translateX: pressed ? 2 : 0 },
                  { translateY: pressed ? 2 : 0 },
                ],
              }}
            >
              <Icon color={theme.colors.primary} name="plus" size={20} />
            </Paper>
          )}
        </Pressable>
      </Paper>

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ReorderableList
          // styles
          cellAnimations={{ opacity: 1 }}
          className="my-4"
          contentContainerClassName="px-4 gap-2"
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id.toString()}
          onReorder={reorderTasks}
          renderItem={({ item }) => <TaskItem task={item} />}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </>
  );
}
