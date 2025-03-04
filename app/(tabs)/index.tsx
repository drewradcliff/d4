import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/Colors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { isNull } from "drizzle-orm";
import { queryClient } from "../_layout";

export default function InboxScreen() {
  const [description, setDescription] = useState("");
  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () =>
      await db.select().from(tasks).where(isNull(tasks.priority)),
  });
  const { mutate } = useMutation({
    mutationFn: async () => {
      await db.insert(tasks).values({
        description,
      });
    },
    onSuccess: () => {
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleAddTask = () => {
    if (description.trim() === "") return;
    mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <Text className="text-4xl font-public-sans-bold text-primary">Inbox</Text>
      <View className="flex-row items-center gap-2 pt-2">
        <TextInput
          className="border border-primary p-3 bg-white flex-1 font-public-sans-light"
          placeholder="Add task..."
          placeholderTextColor={colors.secondary}
          value={description}
          onChangeText={setDescription}
        />
        <Pressable onPress={handleAddTask}>
          {({ pressed }) => (
            <View
              className="rounded-full p-3 border border-primary bg-background"
              style={{
                shadowOffset: {
                  height: pressed ? 0 : 2,
                  width: pressed ? 0 : 2,
                },
                shadowColor: colors.primary,
                shadowOpacity: 1,
                shadowRadius: 0,
                transform: [
                  { translateX: pressed ? 2 : 0 },
                  { translateY: pressed ? 2 : 0 },
                ],
              }}
            >
              <Feather name="plus" size={16} color={colors.primary} />
            </View>
          )}
        </Pressable>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text className="font-public-sans-light">{item.description}</Text>
        )}
      />
    </SafeAreaView>
  );
}
