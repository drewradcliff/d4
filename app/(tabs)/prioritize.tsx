import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";

const CARD_SIZE = 250;
const MIN_DISTANCE = Math.floor(CARD_SIZE / 3);

export default function PrioritizeScreen() {
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

  const [priority, setPriority] = useState<string>();
  useEffect(() => {
    if (backgroundColor.value === "white") return;
    console.log(backgroundColor.value);
    setPriority(backgroundColor.value);
  }, [backgroundColor.value]);

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
    })
    .onEnd(() => {
      if (opacity.value === 0) {
        // transition task
        console.log(backgroundColor.value);
      } else {
        // smoothly translate to origin
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
      }
    })
    .runOnJS(true);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
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
        {/* headings */}
        <View className="absolute w-full flex-row">
          <View className="flex-1">
            <Text className="text-center font-public-sans-bold text-xl text-placeholder">
              Urgent
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-center font-public-sans-bold text-xl text-placeholder">
              Not Urgent
            </Text>
          </View>
        </View>
        <View className="absolute h-full">
          <View className="flex-1 justify-center">
            <Text className="-ml-12 -rotate-90 overflow-visible text-center font-public-sans-bold text-xl text-placeholder">
              Important
            </Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="-ml-12 -rotate-90 overflow-visible text-center font-public-sans-bold text-xl text-placeholder">
              Not Important
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          {/* grid lines */}
          <View className="absolute w-full">
            <Svg
              height="1"
              width="100%"
              stroke={colors.primary}
              strokeDasharray="10 5"
            >
              <Line x1="0" y1="0" x2="100%" y2="0" />
            </Svg>
          </View>
          <View className="absolute h-full">
            <Svg
              height="100%"
              width="1"
              stroke={colors.primary}
              strokeDasharray="10 5"
            >
              <Line x1="0" y1="0" x2="0" y2="100%" />
            </Svg>
          </View>

          {/* card */}
          <GestureDetector gesture={pan}>
            <ShadowView
              as={Animated.View}
              style={[
                {
                  height: CARD_SIZE,
                  width: CARD_SIZE,
                  shadowOffset: { height: 4, width: 4 },
                },
                cardAnimatedStyle,
              ]}
            >
              <View className="absolute size-full">
                {priority === "do" && (
                  <View className="border-doPrimary absolute bottom-0 right-0 m-6 -rotate-12 border-2 p-1">
                    <Text className="text-doPrimary font-public-sans-bold text-2xl uppercase">
                      do
                    </Text>
                  </View>
                )}
                {priority === "decide" && (
                  <View className="border-decidePrimary absolute bottom-0 left-0 m-6 rotate-12 border-2 p-1">
                    <Text className="text-decidePrimary font-public-sans-bold text-2xl uppercase">
                      decide
                    </Text>
                  </View>
                )}
                {priority === "delegate" && (
                  <View className="border-delegatePrimary absolute bottom-0 right-0 m-6 -rotate-12 border-2 p-1">
                    <Text className="text-delegatePrimary font-public-sans-bold text-2xl uppercase">
                      delegate
                    </Text>
                  </View>
                )}
                {priority === "delete" && (
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
              <View className="px-7 py-9">
                <Text className="font-public-sans-bold text-4xl text-primary">
                  Write blog post
                </Text>
              </View>
            </ShadowView>
          </GestureDetector>
        </View>
      </View>
    </SafeAreaView>
  );
}
