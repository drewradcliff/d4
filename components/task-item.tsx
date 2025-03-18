import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

export function TaskItem({
  item: task,
  drag,
  isActive,
}: RenderItemParams<Task>) {
  const [description, setDescription] = useState(task.description);
  const [isFocused, setIsFocused] = useState(false);

  const isEmpty = !description.trim();

  const updateTask = async () => {
    if (isEmpty) {
      await deleteTask();
    } else {
      await db.update(tasks).set({ description }).where(eq(tasks.id, task.id));
    }
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

  return (
    <ScaleDecorator>
      <Paper className="flex-row items-center gap-3 px-3 py-2" elevation={2}>
        <Pressable
          hitSlop={8}
          onPress={toggleTask}
          onLongPress={drag}
          disabled={isActive}
        >
          <Paper className="size-10 items-center justify-center rounded-full">
            {task.completedAt && (
              <Feather name="check" size={16} color={theme.colors.primary} />
            )}
          </Paper>
        </Pressable>
        <View className="flex-1 flex-row gap-2">
          <TextInput
            className={clsx(
              "flex-1 font-public-sans-light text-xl leading-[0] text-primary",
              task.completedAt && "line-through",
            )}
            editable={!task.completedAt}
            value={description}
            onChangeText={setDescription}
            onEndEditing={updateTask}
            onSubmitEditing={updateTask}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && isEmpty) {
                deleteTask();
              }
            }}
          />
          <Pressable
            hitSlop={8}
            className={clsx(
              "size-12 items-center justify-center",
              isFocused ? "visible" : "invisible",
            )}
            onPress={deleteTask}
          >
            <Feather name="x" size={18} color={theme.colors.primary} />
          </Pressable>
        </View>
      </Paper>
    </ScaleDecorator>
  );
}
