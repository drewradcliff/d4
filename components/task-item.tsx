import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useReorderableDrag } from "react-native-reorderable-list";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

export function TaskItem({ task }: { task: Task }) {
  const [description, setDescription] = useState(task.description);
  const [isFocused, setIsFocused] = useState(false);
  const drag = useReorderableDrag();

  const isEmpty = !description.trim();

  const updateTask = async () => {
    if (isEmpty) {
      await deleteTask();
    } else {
      await db.update(tasks).set({ description }).where(eq(tasks.id, task.id));
    }
    setIsFocused(false);
  };

  const deleteTask = async () => {
    await db.delete(tasks).where(eq(tasks.id, task.id));
  };

  const toggleTask = async () => {
    await db
      .update(tasks)
      .set({ completedAt: task.completedAt ? null : new Date().toISOString() })
      .where(eq(tasks.id, task.id));
  };

  const textClassName = clsx(
    "flex-1 font-public-sans-light text-xl leading-[0] text-primary",
    task.completedAt && "line-through",
  );

  return (
    <Paper className="mb-4" elevation={2}>
      <Pressable
        onLongPress={drag}
        className="flex-1 flex-row items-center gap-3 px-3 py-2"
      >
        <Pressable hitSlop={8} onLongPress={drag} onPress={toggleTask}>
          <Paper className="size-10 items-center justify-center rounded-full">
            {task.completedAt && (
              <Feather name="check" size={16} color={theme.colors.primary} />
            )}
          </Paper>
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2">
          {!isFocused ?
            <Text
              suppressHighlighting
              className={textClassName}
              onPress={() => setIsFocused(true)}
              onLongPress={drag}
            >
              {description}
            </Text>
          : <TextInput
              autoFocus
              className={textClassName}
              editable={!task.completedAt}
              value={description}
              onChangeText={setDescription}
              onEndEditing={updateTask}
              onSubmitEditing={updateTask}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && isEmpty) {
                  deleteTask();
                }
              }}
            />
          }
          <Pressable
            hitSlop={8}
            className={clsx(
              "size-12 items-center justify-center",
              isFocused ? "visible" : "invisible",
            )}
            onPress={deleteTask}
            onLongPress={drag}
          >
            <Feather name="x" size={18} color={theme.colors.primary} />
          </Pressable>
        </View>
      </Pressable>
    </Paper>
  );
}
