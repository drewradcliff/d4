import { Feather } from "@expo/vector-icons";
import { eq, isNull } from "drizzle-orm";
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
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

const SCROLL_THRESHOLD = 50;

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
    await db.insert(tasks).values({ description });
    setDescription("");
  };

  const reorderTasks = async (data: Task[]) => {
    await db.transaction(async (tx) => {
      data.map(async (item, index) =>
        tx.update(tasks).set({ position: index }).where(eq(tasks.id, item.id)),
      );
    });
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
          onDragEnd={({ data }) => reorderTasks(data)}
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
