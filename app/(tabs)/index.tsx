import { isNull, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useContext, useState, useRef } from "react";
import { FlatList, Keyboard, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
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
const ITEM_HEIGHT = 70; // matches the height of the TaskItem

export default function InboxScreen() {
  const [description, setDescription] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const itemPositions = useSharedValue<{ [key: string]: number }>({});
  const itemRefs = useRef(new Map<string, { y: number; height: number }>());
  const movingItemId = useSharedValue<string | null>(null);

  const native = Gesture.Native();

  const tabBarHeight = useContext(TabBarHeightContext);
  const insets = useSafeAreaInsets();

  const keyboard = useAnimatedKeyboard({
    isNavigationBarTranslucentAndroid: true,
    isStatusBarTranslucentAndroid: true,
  });

  const paddingStyle = useAnimatedStyle(() => ({
    height: Math.max(
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

  const handleReorderStart = () => {
    setIsReordering(true);
  };

  const handleReorderEnd = () => {
    setIsReordering(false);
    // Here we would update the positions in the database
    // But for now we're just focusing on the animation
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

      <GestureDetector gesture={native}>
        <FlatList
          className="mt-4"
          contentContainerClassName="gap-2 px-4"
          keyboardShouldPersistTaps="handled"
          data={data}
          keyExtractor={(task) => task.id.toString()}
          renderItem={({ item, index }) => (
            <TaskItem
              scrollGesture={native}
              task={item}
              onReorderStart={handleReorderStart}
              onReorderEnd={handleReorderEnd}
              itemRefs={itemRefs}
              itemPositions={itemPositions}
              itemHeight={ITEM_HEIGHT}
              movingItemId={movingItemId}
              currentIndex={index}
              tasksCount={data?.length || 0}
            />
          )}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < -SCROLL_THRESHOLD) {
              Keyboard.dismiss();
            }
          }}
          scrollEnabled={!isReordering}
          ListFooterComponent={<Animated.View style={paddingStyle} />}
        />
      </GestureDetector>
    </TabView>
  );
}
