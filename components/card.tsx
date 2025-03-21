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
  task,
  style,
  ...props
}: React.ComponentProps<typeof CardBase> & { task: Task }) {
  const [quadrant, setQuadrant] = useState<Task["priority"]>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const opacity = useDerivedValue(() => {
    if (translateX.value === 0 || translateY.value === 0) return 0;

    const dx = Math.abs(translateX.value);
    const dy = Math.abs(translateY.value);
    return Math.min(Math.min(dx / MIN_DISTANCE, dy / MIN_DISTANCE), 1);
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: theme.colors.background[quadrant || "white"],
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      setQuadrant(
        translateX.value < 0 && translateY.value < 0 ? "do"
        : translateX.value > 0 && translateY.value < 0 ? "decide"
        : translateX.value < 0 && translateY.value > 0 ? "delegate"
        : translateX.value > 0 && translateY.value > 0 ? "delete"
        : null,
      );
    })
    .onEnd(async () => {
      if (opacity.value === 1) {
        // transition task
        await db
          .update(tasks)
          .set({ priority: quadrant })
          .where(eq(tasks.id, task.id));
      } else {
        // smoothly translate to origin
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
      }
    })
    .runOnJS(true);

  const foregroundColor = quadrant ? theme.colors.foreground[quadrant] : "none";
  const isLeft = quadrant === "do" || quadrant === "delegate";

  return (
    <GestureDetector gesture={pan}>
      <CardBase as={Animated.View} style={[style, animatedStyle]} {...props}>
        <Animated.View
          className="absolute size-full"
          style={backgroundAnimatedStyle}
        >
          <View
            className={clsx(
              "absolute bottom-0 m-6",
              isLeft ? "right-0 -rotate-12" : "left-0 rotate-12",
            )}
          >
            <Text
              className="border-2 p-1 font-lexend-bold text-2xl uppercase"
              style={{ color: foregroundColor, borderColor: foregroundColor }}
            >
              {quadrant}
            </Text>
          </View>
        </Animated.View>
        <CardText>{task.description}</CardText>
      </CardBase>
    </GestureDetector>
  );
}

export function CardBase({
  className,
  style,
  ...props
}: React.ComponentProps<typeof Paper>) {
  return (
    <Paper
      className={clsx("bg-white", className)}
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
        className={clsx("font-lexend-bold text-4xl text-primary", className)}
        {...props}
      />
    </View>
  );
}
