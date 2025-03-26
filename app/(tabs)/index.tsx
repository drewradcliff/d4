import { isNull, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useContext, useState } from "react";
import { Keyboard, Pressable } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarHeightContext, TabView } from "@/app/(tabs)/_layout";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Paper } from "@/components/paper";
import { TaskItem } from "@/components/task-item";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { theme } from "@/tailwind.config";

const SCROLL_THRESHOLD = 50;

export default function InboxScreen() {
  const [description, setDescription] = useState("");

  const tabBarHeight = useContext(TabBarHeightContext);
  const insets = useSafeAreaInsets();

  const keyboard = useAnimatedKeyboard({
    isNavigationBarTranslucentAndroid: true,
    isStatusBarTranslucentAndroid: true,
  });

  const paddingStyle = useAnimatedStyle(() => {
    return {
      height: Math.max(
        keyboard.height.value + 16,
        tabBarHeight + insets.bottom + 16,
      ),
    };
  });

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

      <Animated.ScrollView
        className="mt-4"
        contentContainerClassName="gap-2 px-4"
        keyboardShouldPersistTaps="handled"
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y < -SCROLL_THRESHOLD) {
            Keyboard.dismiss();
          }
        }}
      >
        {data?.map((task) => <TaskItem key={task.id} task={task} />)}
        <Animated.View style={paddingStyle} />
      </Animated.ScrollView>
    </TabView>
  );
}
