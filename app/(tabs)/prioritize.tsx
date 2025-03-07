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
import Svg, { Line } from "react-native-svg";

import { ShadowView } from "@/components/shadow-view";
import { colors } from "@/constants/colors";

const COLORS = [colors.do, colors.decide, colors.delegate, colors.delete];
const RADIUS = 125;
const ANGLE = 10;

export default function PrioritizeScreen() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const distance = useDerivedValue(() => {
    return Math.sqrt(translateX.value ** 2 + translateY.value ** 2);
  });
  const angle = useDerivedValue(() => {
    return (
      Math.atan2(translateY.value, translateX.value) * (180 / Math.PI) + 180
    );
  });
  const priority = useDerivedValue(() => {
    if (translateX.value < 0 && translateY.value < 0) return "do";
    if (translateX.value > 0 && translateY.value < 0) return "decide";
    if (translateX.value < 0 && translateY.value > 0) return "delegate";
    if (translateX.value > 0 && translateY.value > 0) return "delete";
    return undefined;
  });

  const animatedStyles = useAnimatedStyle(() => {
    const quadrant = Math.floor(angle.value / 90);
    const localAngle = angle.value % 90;

    const color = COLORS[quadrant];
    const minAngle = ANGLE;
    const maxAngle = 90 - ANGLE;

    const backgroundColor =
      localAngle < minAngle
        ? interpolateColor(localAngle, [0, minAngle], ["white", color])
        : localAngle > maxAngle
          ? interpolateColor(localAngle, [maxAngle, 90], [color, "white"])
          : color;

    return {
      backgroundColor,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (Math.abs(distance.value) > RADIUS) {
        console.log(priority.value);
      } else {
        // smoothly translate to origin
        translateX.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
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
            <ShadowView
              as={Animated.View}
              className="relative h-[250px] w-[250px] px-7 py-9"
              style={[
                { shadowOffset: { height: 4, width: 4 } },
                animatedStyles,
              ]}
            >
              <Text className="font-public-sans-bold text-4xl text-primary">
                Write blog post
              </Text>
            </ShadowView>
          </GestureDetector>
        </View>
      </View>
    </SafeAreaView>
  );
}
