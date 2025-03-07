import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";

const RADIUS = 125;

export default function PrioritizeScreen() {
  const colorIntensity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const distance = useDerivedValue(() => {
    return Math.sqrt(translateX.value ** 2 + translateY.value ** 2);
  });
  const priority = useDerivedValue(() => {
    if (translateX.value < 0 && translateY.value < 0) return "do";
    if (translateX.value > 0 && translateY.value < 0) return "decide";
    if (translateX.value < 0 && translateY.value > 0) return "delegate";
    if (translateX.value > 0 && translateY.value > 0) return "delete";
    return undefined;
  });

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: priority.value
      ? interpolateColor(
          colorIntensity.value,
          [0, 1],
          ["white", colors[priority.value]],
        )
      : "white",
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      colorIntensity.value = Math.min(distance.value / RADIUS, 1);
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      console.log(distance.value);
    })
    .onEnd(() => {
      if (Math.abs(distance.value) > RADIUS) {
        console.log(priority.value);
      } else {
        // smoothly translate to origin
        colorIntensity.value = withTiming(0, { duration: 100 });
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
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
        <View className="flex-1 items-center justify-center">
          <ShadowView
            as={Animated.View}
            className="relative h-[250px] w-[250px] px-7 py-9"
            style={[{ shadowOffset: { height: 4, width: 4 } }, animatedStyles]}
          >
            <Text className="font-public-sans-bold text-4xl text-primary">
              Write blog post
            </Text>
          </ShadowView>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}
