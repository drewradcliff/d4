import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  NativeGesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming,
  SharedValue,
  useDerivedValue,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/tailwind.config";

type TaskItemProps = {
  scrollGesture: NativeGesture;
  task: Task;
  onReorderStart?: () => void;
  onReorderEnd?: () => void;
  itemRefs?: React.MutableRefObject<Map<string, { y: number; height: number }>>;
  itemPositions?: SharedValue<{ [key: string]: number }>;
  itemHeight?: number;
  movingItemId?: SharedValue<string | null>;
  currentIndex?: number;
  tasksCount?: number;
};

export function TaskItem({
  scrollGesture,
  task,
  onReorderStart,
  onReorderEnd,
  itemRefs,
  itemPositions,
  itemHeight = 80,
  movingItemId,
  currentIndex = 0,
  tasksCount = 0,
}: TaskItemProps) {
  const [description, setDescription] = useState(task.description);
  const [isFocused, setIsFocused] = useState(false);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const taskId = task.id.toString();

  const isEmpty = !description.trim();

  // Calculate position during reordering
  const positionY = useDerivedValue(() => {
    if (!movingItemId?.value || !itemPositions?.value) return 0;

    // If this is the item being dragged, don't add additional translation
    if (movingItemId.value === taskId) return 0;

    // Calculate position based on the moving item
    const movingItemPosition = itemPositions.value[movingItemId.value] || 0;
    const thisPosition = currentIndex;
    const movingItemIndex = parseInt(
      movingItemId.value.split("-")[1] || "0",
      10,
    );

    // Detect if this item should move up or down
    if (movingItemIndex > thisPosition && movingItemPosition <= thisPosition) {
      // Moving item is going above this item
      return withTiming(itemHeight, { duration: 250 });
    } else if (
      movingItemIndex < thisPosition &&
      movingItemPosition >= thisPosition
    ) {
      // Moving item is going below this item
      return withTiming(-itemHeight, { duration: 250 });
    }

    // Return to original position
    return withTiming(0, { duration: 250 });
  });

  const updateTask = async () => {
    if (isEmpty) {
      await deleteTask();
    } else {
      await db.update(tasks).set({ description }).where(eq(tasks.id, task.id));
    }
    setIsFocused(false);
  };

  const deleteTask = async () => {
    await db.delete(tasks).where(eq(tasks.id, task.id));
  };

  const toggleTask = async () => {
    await db
      .update(tasks)
      .set({ completedAt: task.completedAt ? null : new Date().toISOString() })
      .where(eq(tasks.id, task.id));
  };

  const updatePriority = async (priority: Task["priority"]) => {
    if (!priority) return;
    await db.update(tasks).set({ priority }).where(eq(tasks.id, task.id));
  };

  const textClassName = clsx(
    "flex-1 py-4 font-lexend-medium text-sm text-primary",
    task.completedAt && "line-through",
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(500)
    .onStart(() => {
      scale.value = withTiming(1.05, { duration: 100 });
      zIndex.value = 999;
      if (movingItemId) {
        movingItemId.value = taskId;
      }
      if (onReorderStart) {
        runOnJS(onReorderStart)();
      }
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      translateX.value = event.translationX;

      if (itemPositions && movingItemId?.value === taskId) {
        // Calculate the new position based on the dragged distance
        const newPosition = Math.max(
          0,
          Math.min(
            Math.floor(
              (currentIndex * itemHeight + event.translationY) / itemHeight,
            ),
            tasksCount - 1,
          ),
        );

        itemPositions.value = {
          ...itemPositions.value,
          [taskId]: newPosition,
        };
      }
    })
    .onEnd((event) => {
      // Check if this is a priority change gesture
      if (event.absoluteY < 170 && event.absoluteY > 130) {
        let newPriority: Task["priority"] = null;

        if (event.absoluteX > 25 && event.absoluteX < 55) {
          newPriority = "do";
        } else if (event.absoluteX > 75 && event.absoluteX < 140) {
          newPriority = "decide";
        } else if (event.absoluteX > 150 && event.absoluteX < 235) {
          newPriority = "delegate";
        } else if (event.absoluteX > 245 && event.absoluteX < 315) {
          newPriority = "delete";
        }

        runOnJS(updatePriority)(newPriority);
      }

      translateY.value = withTiming(0, { duration: 100 });
      translateX.value = withTiming(0, { duration: 100 });
      scale.value = withTiming(1, { duration: 100 });
      zIndex.value = 1;

      if (movingItemId) {
        movingItemId.value = null;
      }

      if (onReorderEnd) {
        runOnJS(onReorderEnd)();
      }
    });

  const dragGesture = Gesture.Race(pan, scrollGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + positionY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animatedStyle, { height: itemHeight }]}>
        <Paper
          className="flex-1 flex-row items-center gap-3 rounded-md bg-white px-3 py-1"
          elevation={2}
        >
          <Pressable hitSlop={8} onPress={toggleTask}>
            <Paper
              className="size-10 items-center justify-center rounded-full bg-white"
              elevation={0}
            >
              {task.completedAt && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </Paper>
          </Pressable>
          <View className="flex-1 flex-row items-center gap-2">
            {!isFocused ?
              <Text
                suppressHighlighting
                className={textClassName}
                onPress={() => setIsFocused(true)}
              >
                {description}
              </Text>
            : <Input
                autoFocus
                className={textClassName}
                editable={!task.completedAt}
                value={description}
                onChangeText={setDescription}
                onEndEditing={updateTask}
                onSubmitEditing={updateTask}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && isEmpty) {
                    deleteTask();
                  }
                }}
              />
            }
            <Pressable
              hitSlop={8}
              className={clsx(
                "size-12 items-center justify-center",
                isFocused ? "visible" : "invisible",
              )}
              onPress={deleteTask}
            >
              <Icon name="x" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        </Paper>
      </Animated.View>
    </GestureDetector>
  );
}
