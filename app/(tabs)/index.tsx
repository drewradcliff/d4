import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { eq, isNull } from "drizzle-orm";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { queryClient } from "../_layout";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () =>
      await db.select().from(tasks).where(isNull(tasks.priority)),
  });

  const { mutate: addTask } = useMutation({
    mutationFn: async () => {
      if (!description.trim()) return;
      await db.insert(tasks).values({ description });
    },
    onSuccess: () => {
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <StatusBar style="dark" />
      <Text className="font-public-sans-bold text-4xl text-primary">Inbox</Text>
      <View className="flex-row items-center gap-2 pt-5">
        <TextInput
          className="flex-1 border border-primary bg-white p-3 font-public-sans-light text-primary"
          placeholder="Add task..."
          placeholderTextColor={colors.secondary}
          value={description}
          onChangeText={setDescription}
          onSubmitEditing={() => addTask()}
          submitBehavior="submit"
        />
        <Pressable onPress={() => addTask()}>
          {({ pressed }) => (
            <ShadowView
              className="rounded-full p-3"
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
              <Feather name="plus" size={16} color={colors.primary} />
            </ShadowView>
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

  const { mutate: updateTask } = useMutation({
    mutationFn: async ({
      id,
      description,
    }: {
      id: number;
      description: string;
    }) => {
      if (!description.trim()) return;
      await db.update(tasks).set({ description }).where(eq(tasks.id, id));
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: async () => {
      await db.delete(tasks).where(eq(tasks.id, item.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
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
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <Pressable onPress={() => setIsEditing(!isEditing)}>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => {
            toggleTask({
              id: item.id,
              completedAt: item.completedAt ? null : new Date().toISOString(),
            });
          }}
        >
          <ShadowView className="h-4 w-4 items-center justify-center rounded-full">
            {item.completedAt && (
              <Feather name="check" size={12} color={colors.primary} />
            )}
          </ShadowView>
        </Pressable>
        {isEditing ? (
          <View className="flex-1 flex-row gap-2 pr-3">
            <TextInput
              className="flex-1 font-public-sans-light text-primary"
              autoFocus
              value={description}
              onChangeText={setDescription}
              onBlur={() => {
                if (!description.trim()) deleteTask();
                updateTask({ id: item.id, description });
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Enter") {
                  if (!description.trim()) deleteTask();
                  updateTask({ id: item.id, description });
                } else if (
                  nativeEvent.key === "Backspace" &&
                  !description.trim()
                )
                  deleteTask();
              }}
            />
            <Pressable onPress={() => deleteTask()}>
              <Feather name="x" size={18} color={colors.primary} />
            </Pressable>
          </View>
        ) : (
          <Text
            className={clsx(
              "font-public-sans-light text-primary",
              item.completedAt && "line-through",
            )}
          >
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
