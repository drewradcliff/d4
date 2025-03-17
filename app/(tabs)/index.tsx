import { Feather } from "@expo/vector-icons";
import { isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/header";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
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
        <FlatList
          ref={flatListRef}
          contentContainerClassName="gap-4 p-6"
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TaskItem task={item} />}
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
