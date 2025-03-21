import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

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

  const textClassName = clsx(
    "flex-1 py-4 font-public-sans-light text-xl leading-[0] text-primary",
    task.completedAt && "line-through",
  );

  const longPress = Gesture.LongPress()
    .onStart(() => {
      isLongPressed.value = true;
      scale.value = withSpring(1.05);
    })
    .minDuration(200);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (isLongPressed.value) {
        translateY.value = event.translationY;
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      translateY.value = withSpring(0);
      translateX.value = withSpring(0);
      scale.value = withSpring(1);
      isLongPressed.value = false;
    });

  const gesture = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Paper className="mb-4" elevation={2}>
          <Pressable className="flex-1 flex-row items-center gap-3 px-3 py-1">
            <Pressable hitSlop={8} onPress={toggleTask}>
              <Paper className="size-10 items-center justify-center rounded-full">
                {task.completedAt && (
                  <Feather
                    name="check"
                    size={16}
                    color={theme.colors.primary}
                  />
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
              : <TextInput
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
                <Feather name="x" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          </Pressable>
        </Paper>
      </Animated.View>
    </GestureDetector>
  );
}
