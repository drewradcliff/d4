import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/Colors";

const RADIUS = 250;

const getPriority = (x: number, y: number) => {
  if (x < 0 && y < 0) return "do";
  if (x > 0 && y < 0) return "decide";
  if (x < 0 && y > 0) return "delegate";
  if (x > 0 && y > 0) return "delete";
};

const getDistance = (x: number, y: number) => {
  return Math.sqrt(x ** 2 + y ** 2);
};

export default function PrioritizeScreen() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const priority = useSharedValue<ReturnType<typeof getPriority>>(undefined);

  const animatedViewStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedShadowViewStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      priority.value = getPriority(event.translationX, event.translationY);

      const distance = getDistance(event.translationX, event.translationY);
      console.log(distance);
      console.log("opacity: ", distance / RADIUS);

      opacity.value = distance / RADIUS;
    })
    .onEnd(({ translationX, translationY }) => {
      const distance = getDistance(translationX, translationY);
      if (Math.abs(distance) > RADIUS) {
        const priority = getPriority(translationX, translationY);
        console.log(priority);
      } else {
        // smoothly translate to origin
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
        opacity.value = withTiming(0, { duration: 100 });
      }
    })
    .runOnJS(true);

  return (
    <SafeAreaView className="flex-1 bg-background p-6">
      <StatusBar style="dark" />
      <Text className="font-public-sans-bold text-4xl text-primary">
        Prioritize
      </Text>
      <Text className="pt-1 font-public-sans-light text-secondary">
        Drag tasks to quadrants to prioritize.{" "}
        <Text className="underline">Learn more</Text> about Eisenhower Matrix.
      </Text>
      <View className="absolute left-0 top-0 h-full w-full border-t border-dashed border-secondary" />
      <GestureDetector gesture={pan}>
        <Animated.View
          className="flex-1 items-center justify-center"
          style={animatedViewStyles}
        >
          <ShadowView
            className="relative h-[250px] w-[250px]"
            style={{ shadowOffset: { height: 4, width: 4 } }}
          >
            <Animated.View
              className="absolute size-full"
              style={[
                {
                  backgroundColor: priority.value
                    ? colors[priority.value]
                    : "white",
                },
                animatedShadowViewStyles,
              ]}
            />
            <View className="px-7 py-9">
              <Text className="font-public-sans-bold text-4xl text-primary">
                Write blog post
              </Text>
            </View>
          </ShadowView>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}
