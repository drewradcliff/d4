import { useMutation } from "@tanstack/react-query";
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

import { queryClient } from "@/app/_layout";
import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";

const CARD_SIZE = 250;
const MIN_DISTANCE = Math.floor(CARD_SIZE / 3);

export type CardProps = CardBaseProps & { data: typeof tasks.$inferSelect };

export function Card({ data, style, ...props }: CardProps) {
  const [quadrant, setQuadrant] = useState<typeof data.priority>(null);

  const { mutate: updateTask } = useMutation({
    mutationFn: (priority: typeof data.priority) =>
      db.update(tasks).set({ priority }).where(eq(tasks.id, data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

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
    backgroundColor: colors[backgroundColor.value],
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
            <View className="border-doPrimary absolute bottom-0 right-0 m-6 -rotate-12 border-2 p-1">
              <Text className="text-doPrimary font-public-sans-bold text-2xl uppercase">
                do
              </Text>
            </View>
          )}
          {quadrant === "decide" && (
            <View className="border-decidePrimary absolute bottom-0 left-0 m-6 rotate-12 border-2 p-1">
              <Text className="text-decidePrimary font-public-sans-bold text-2xl uppercase">
                decide
              </Text>
            </View>
          )}
          {quadrant === "delegate" && (
            <View className="border-delegatePrimary absolute bottom-0 right-0 m-6 -rotate-12 border-2 p-1">
              <Text className="text-delegatePrimary font-public-sans-bold text-2xl uppercase">
                delegate
              </Text>
            </View>
          )}
          {quadrant === "delete" && (
            <View className="border-deletePrimary absolute bottom-0 left-0 m-6 rotate-12 border-2 p-1">
              <Text className="text-deletePrimary font-public-sans-bold text-2xl uppercase">
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

export type CardBaseProps = React.ComponentProps<typeof ShadowView>;

export function CardBase({ style, ...props }: CardBaseProps) {
  return (
    <ShadowView
      style={[
        {
          height: CARD_SIZE,
          width: CARD_SIZE,
          shadowOffset: { height: 4, width: 4 },
        },
        style,
      ]}
      {...props}
    />
  );
}

export type CardTextProps = React.ComponentProps<typeof Text>;

export function CardText({ className, ...props }: CardTextProps) {
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
