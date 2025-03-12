import clsx from "clsx";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

import { Paper } from "@/components/paper";
import { db } from "@/db/client";
import { Task, tasks } from "@/db/schema";
import { theme } from "@/styles/theme";

const CARD_SIZE = 250;
const MIN_DISTANCE = Math.floor(CARD_SIZE / 3);

export function Card({
  data,
  style,
  ...props
}: React.ComponentProps<typeof CardBase> & { data: Task }) {
  const [quadrant, setQuadrant] = useState<typeof data.priority>(null);

  const updateTask = async (priority: Task["priority"]) => {
    await db.update(tasks).set({ priority }).where(eq(tasks.id, data.id));
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const backgroundColor = useDerivedValue(() => {
    if (translateX.value < 0 && translateY.value < 0) return "do";
    if (translateX.value > 0 && translateY.value < 0) return "decide";
    if (translateX.value < 0 && translateY.value > 0) return "delegate";
    if (translateX.value > 0 && translateY.value > 0) return "delete";
    return "white";
  });
  const opacity = useDerivedValue(() => {
    if (translateX.value === 0 || translateY.value === 0) return 1;

    const dx = Math.abs(translateX.value);
    const dy = Math.abs(translateY.value);
    return Math.max(1 - Math.min(dx / MIN_DISTANCE, dy / MIN_DISTANCE), 0);
  });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: theme.colors[backgroundColor.value],
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const cardBackgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (backgroundColor.value === "white") return;
      setQuadrant(backgroundColor.value);
    })
    .onEnd(() => {
      const priority = opacity.value === 0 ? quadrant : null;

      if (priority) {
        // transition task
        updateTask(priority);
      } else {
        // smoothly translate to origin
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
      }
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={pan}>
      <CardBase
        as={Animated.View}
        style={[style, cardAnimatedStyle]}
        {...props}
      >
        <View className="absolute size-full">
          {quadrant === "do" && (
            <View className="absolute bottom-0 right-0 m-6 -rotate-12 border-2 border-doPrimary p-1">
              <Text className="font-public-sans-bold text-2xl uppercase text-doPrimary">
                do
              </Text>
            </View>
          )}
          {quadrant === "decide" && (
            <View className="absolute bottom-0 left-0 m-6 rotate-12 border-2 border-decidePrimary p-1">
              <Text className="font-public-sans-bold text-2xl uppercase text-decidePrimary">
                decide
              </Text>
            </View>
          )}
          {quadrant === "delegate" && (
            <View className="absolute bottom-0 right-0 m-6 -rotate-12 border-2 border-delegatePrimary p-1">
              <Text className="font-public-sans-bold text-2xl uppercase text-delegatePrimary">
                delegate
              </Text>
            </View>
          )}
          {quadrant === "delete" && (
            <View className="absolute bottom-0 left-0 m-6 rotate-12 border-2 border-deletePrimary p-1">
              <Text className="font-public-sans-bold text-2xl uppercase text-deletePrimary">
                delete
              </Text>
            </View>
          )}
        </View>
        <Animated.View
          className="absolute size-full bg-white"
          style={cardBackgroundAnimatedStyle}
        />
        <CardText>{data.description}</CardText>
      </CardBase>
    </GestureDetector>
  );
}

export function CardBase({
  style,
  ...props
}: React.ComponentProps<typeof Paper>) {
  return (
    <Paper
      elevation={4}
      style={[{ height: CARD_SIZE, width: CARD_SIZE }, style]}
      {...props}
    />
  );
}

export function CardText({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <View className="px-7 py-9">
      <Text
        className={clsx(
          "font-public-sans-bold text-4xl text-primary",
          className,
        )}
        {...props}
      />
    </View>
  );
}
