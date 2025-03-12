import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const { data } = useLiveQuery(
    db.select().from(tasks).where(isNull(tasks.priority)),
  );

  const addTask = async () => {
    if (!description.trim()) return;
    await db.insert(tasks).values({ description });
    setDescription("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <Text className="font-public-sans-bold text-4xl text-primary">Inbox</Text>
      <View className="flex-row items-center gap-2 pt-5">
        <TextInput
          className="flex-1 border border-primary bg-white p-3 font-public-sans-light text-primary"
          placeholder="Add task..."
          placeholderTextColor={theme.colors.secondary}
          value={description}
          onChangeText={setDescription}
          onSubmitEditing={addTask}
          submitBehavior="submit"
        />
        <Pressable onPress={addTask}>
          {({ pressed }) => (
            <Paper
              className="rounded-full p-3"
              elevation={pressed ? 0 : 2}
              style={{
                transform: [
                  { translateX: pressed ? 2 : 0 },
                  { translateY: pressed ? 2 : 0 },
                ],
              }}
            >
              <Feather name="plus" size={16} color={theme.colors.primary} />
            </Paper>
          )}
        </Pressable>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 16, paddingTop: 20 }}
        renderItem={({ item }) => <TaskItem item={item} />}
      />
    </SafeAreaView>
  );
}

function TaskItem({ item }: { item: Task }) {
  const [description, setDescription] = useState(item.description);
  const [isEditing, setIsEditing] = useState(false);

  const isEmpty = !description.trim();

  const updateTask = async () => {
    if (isEmpty) {
      await deleteTask();
    } else {
      await db.update(tasks).set({ description }).where(eq(tasks.id, item.id));
    }
    setIsEditing(false);
  };

  const deleteTask = async () => {
    await db.delete(tasks).where(eq(tasks.id, item.id));
  };

  const toggleTask = async () => {
    await db
      .update(tasks)
      .set({ completedAt: item.completedAt ? null : new Date().toISOString() })
      .where(eq(tasks.id, item.id));
  };

  return (
    <Pressable onPress={() => setIsEditing(!isEditing)}>
      <View className="flex-row items-center gap-3">
        <Pressable onPress={toggleTask}>
          <Paper className="h-4 w-4 items-center justify-center rounded-full">
            {item.completedAt && (
              <Feather name="check" size={12} color={theme.colors.primary} />
            )}
          </Paper>
        </Pressable>
        {isEditing ?
          <View className="flex-1 flex-row gap-2 pr-3">
            <TextInput
              className="flex-1 font-public-sans-light text-primary"
              autoFocus
              value={description}
              onChangeText={setDescription}
              onBlur={updateTask}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Enter") {
                  updateTask();
                } else if (nativeEvent.key === "Backspace" && isEmpty) {
                  deleteTask();
                }
              }}
            />
            <Pressable onPress={deleteTask}>
              <Feather name="x" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        : <Text
            className={clsx(
              "font-public-sans-light text-primary",
              item.completedAt && "line-through",
            )}
          >
            {description}
          </Text>
        }
      </View>
    </Pressable>
  );
}
