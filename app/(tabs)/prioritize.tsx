import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShadowView } from "@/components/shadow-view";

const RADIUS = 250;

export default function PrioritizeScreen() {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2,
      );
      console.log(distance);
      if (Math.abs(distance) > RADIUS) {
        if (event.translationX > 0 && event.translationY < 0) {
          console.log("decide");
        } else if (event.translationX < 0 && event.translationY < 0) {
          console.log("do");
        } else if (event.translationX < 0 && event.translationY > 0) {
          console.log("delegate");
        } else {
          console.log("delete");
        }
      } else {
        // smoothly translate to origin
        translationX.value = withTiming(0, { duration: 100 });
        translationY.value = withTiming(0, { duration: 100 });
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
          style={animatedStyles}
        >
          <ShadowView
            className="h-[250px] w-[250px] bg-white px-7 py-9"
            style={{ shadowOffset: { height: 4, width: 4 } }}
          >
            <Text className="font-public-sans-bold text-4xl text-primary">
              Write blog post
            </Text>
          </ShadowView>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}
