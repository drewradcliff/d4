import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/Colors";

const RADIUS = 125;

const getPriority = (x: number, y: number) => {
  "worklet";
  if (x < 0 && y < 0) return "do";
  if (x > 0 && y < 0) return "decide";
  if (x < 0 && y > 0) return "delegate";
  if (x > 0 && y > 0) return "delete";
  return undefined;
};

const getDistance = (x: number, y: number) => {
  return Math.sqrt(x ** 2 + y ** 2);
};

export default function PrioritizeScreen() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  const animatedViewStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedColorStyle = useAnimatedStyle(() => {
    const currentPriority = getPriority(translateX.value, translateY.value);
    const backgroundColor = currentPriority
      ? interpolateColor(
          colorProgress.value,
          [0, 1],
          ["white", colors[currentPriority]],
        )
      : "white";

    return {
      backgroundColor,
    };
  });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      const distance = getDistance(event.translationX, event.translationY);
      colorProgress.value = Math.min(distance / (RADIUS * 0.7), 1);
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
        colorProgress.value = withTiming(0, { duration: 100 });
      }
    })
    .runOnJS(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <View className="p-6">
        <Text className="font-public-sans-bold text-4xl text-primary">
          Prioritize
        </Text>
        <Text className="pt-1 font-public-sans-light text-secondary">
          Drag tasks to quadrants to prioritize.{" "}
          <Text className="underline">Learn more</Text> about Eisenhower Matrix.
        </Text>
      </View>
      <View className="flex-1">
        <View className="absolute inset-0 flex items-center justify-center">
          <Svg height="1" width="100%">
            <Line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke={colors.primary}
              strokeDasharray="10 5"
            />
          </Svg>
          <View className="absolute h-full">
            <Svg height="100%" width="1">
              <Line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke={colors.primary}
                strokeDasharray="10 5"
              />
            </Svg>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <GestureDetector gesture={pan}>
            <Animated.View style={animatedViewStyles}>
              <ShadowView
                className="relative h-[250px] w-[250px]"
                style={{ shadowOffset: { height: 4, width: 4 } }}
              >
                <Animated.View
                  className="absolute size-full"
                  style={[animatedColorStyle]}
                />
                <View className="px-7 py-9">
                  <Text className="font-public-sans-bold text-4xl text-primary">
                    Write blog post
                  </Text>
                </View>
              </ShadowView>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </SafeAreaView>
  );
}
