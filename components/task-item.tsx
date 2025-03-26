import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/tailwind.config";

export function TaskItem({ task }: { task: Task }) {
  const [description, setDescription] = useState(task.description);
  const [isFocused, setIsFocused] = useState(false);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isLongPressed = useSharedValue(false);
  const scale = useSharedValue(1);

  const isEmpty = !description.trim();

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

  const longPress = Gesture.LongPress()
    .onStart(() => {
      isLongPressed.value = true;
      scale.value = withTiming(1.05, { duration: 100 });
    })
    .minDuration(200);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (isLongPressed.value) {
        translateY.value = event.translationY;
        translateX.value = event.translationX;
        console.log("Y:", event.absoluteY);
        console.log("X:", event.absoluteX);
      }
    })
    .onEnd(({ absoluteX, absoluteY }) => {
      if (isLongPressed.value && absoluteY < 170 && absoluteY > 130) {
        let newPriority: Task["priority"] = null;

        if (absoluteX > 25 && absoluteX < 55) {
          newPriority = "do";
        } else if (absoluteX > 75 && absoluteX < 140) {
          newPriority = "decide";
        } else if (absoluteX > 150 && absoluteX < 235) {
          newPriority = "delegate";
        } else if (absoluteX > 245 && absoluteX < 315) {
          newPriority = "delete";
        }

        runOnJS(updatePriority)(newPriority);
      }

      translateY.value = withTiming(0, { duration: 100 });
      translateX.value = withTiming(0, { duration: 100 });
      scale.value = withTiming(1, { duration: 100 });
      isLongPressed.value = false;
    });

  const dragGesture = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    zIndex: isLongPressed.value ? 999 : 1,
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View className="h-20" style={animatedStyle}>
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
