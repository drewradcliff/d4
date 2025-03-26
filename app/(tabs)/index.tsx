import { eq, isNull, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useContext, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarHeightContext, TabView } from "@/app/(tabs)/_layout";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { theme } from "@/tailwind.config";

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const tabBarHeight = useContext(TabBarHeightContext);
  const insets = useSafeAreaInsets();

  const keyboard = useAnimatedKeyboard({
    isNavigationBarTranslucentAndroid: true,
    isStatusBarTranslucentAndroid: true,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(
      keyboard.height.value + 16,
      tabBarHeight + insets.bottom + 16,
    ),
  }));

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
    <TabView>
      <Paper
        className="mx-4 flex-row items-center rounded-md bg-white p-3"
        elevation={4}
      >
        <Input
          className="h-10 flex-1 font-lexend-medium text-sm text-primary"
          placeholder="what's your next move?"
          submitBehavior="submit"
          value={description}
          onChangeText={setDescription}
          onSubmitEditing={addTask}
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

      <Animated.View className="flex-1" style={animatedStyle}>
        <ReorderableList
          cellAnimations={{ opacity: 1 }}
          className="mt-4"
          contentContainerClassName="gap-2 px-4"
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id.toString()}
          onReorder={reorderTasks}
          renderItem={({ item }) => <TaskItem task={item} />}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </TabView>
  );
}
