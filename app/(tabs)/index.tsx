import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eq, isNull } from "drizzle-orm";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { queryClient } from "../_layout";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";

export default function InboxScreen() {
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState<{
    id: number;
    description: string;
  } | null>(null);

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
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await db.delete(tasks).where(eq(tasks.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleTaskUpdate = () => {
    if (!editingTask) return;
    updateTask({ id: editingTask.id, description: editingTask.description });
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <StatusBar style="dark" />
      <Text className="font-public-sans-bold text-4xl text-primary">Inbox</Text>
      <View className="flex-row items-center gap-2 pt-5">
        <TextInput
          className="text flex-1 border border-primary bg-white p-3 font-public-sans-light"
          placeholder="Add task..."
          placeholderTextColor={colors.secondary}
          value={description}
          onChangeText={setDescription}
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
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() =>
              setEditingTask({ id: item.id, description: item.description })
            }
          >
            <View className="flex-row items-center gap-3">
              <ShadowView className="h-4 w-4 rounded-full" />
              {editingTask?.id === item.id ? (
                <View className="flex-1 flex-row gap-2">
                  <TextInput
                    className="flex-1 font-public-sans-light text-primary"
                    value={editingTask.description}
                    onChangeText={(text) =>
                      setEditingTask({ ...editingTask, description: text })
                    }
                    autoFocus
                    onBlur={handleTaskUpdate}
                    onSubmitEditing={handleTaskUpdate}
                  />
                  <Pressable
                    onPress={() => {
                      deleteTask({ id: editingTask.id });
                      setEditingTask(null);
                    }}
                  >
                    <Feather name="x" size={16} color={colors.primary} />
                  </Pressable>
                </View>
              ) : (
                <Text className="font-public-sans-light text-primary">
                  {item.description}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
