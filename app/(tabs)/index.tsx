import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

const SCROLL_THRESHOLD = 50;

export default function InboxScreen() {
  const flatListRef = useRef<FlatList>(null);

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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* heading */}
      <View className="z-10 gap-2 p-6 pb-0">
        <Text className="font-public-sans-bold text-5xl text-primary">
          Inbox
        </Text>
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
      </View>
      {/* tasks */}
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <FlatList
          ref={flatListRef}
          contentContainerClassName="gap-4 p-6"
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TaskItem item={item} />}
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

function TaskItem({ item }: { item: Task }) {
  const [description, setDescription] = useState(item.description);
  const [isFocused, setIsFocused] = useState(false);

  const isEmpty = !description.trim();

  const updateTask = async () => {
    if (isEmpty) {
      await deleteTask();
    } else {
      await db.update(tasks).set({ description }).where(eq(tasks.id, item.id));
    }
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
    <View className="flex-row items-center gap-3">
      <Pressable hitSlop={8} onPress={toggleTask}>
        <Paper className="size-10 items-center justify-center rounded-full">
          {item.completedAt && (
            <Feather name="check" size={16} color={theme.colors.primary} />
          )}
        </Paper>
      </Pressable>
      <View className="flex-1 flex-row gap-2">
        <TextInput
          className={clsx(
            "flex-1 font-public-sans-light text-xl leading-[0] text-primary",
            item.completedAt && "line-through",
          )}
          editable={!item.completedAt}
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
    </View>
  );
}
