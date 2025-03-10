import { useQuery } from "@tanstack/react-query";
import { isNull } from "drizzle-orm";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";

import { Card, CardBase, CardText } from "@/components/card";
import { colors } from "@/constants/colors";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";

const MAX_ITEMS = 3;

export default function PrioritizeScreen() {
  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => db.select().from(tasks).where(isNull(tasks.priority)),
  });

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
          <View className="-ml-12 flex-1 -rotate-90 justify-center">
            <Text className="overflow-visible font-public-sans-bold text-xl text-placeholder">
              Important
            </Text>
          </View>
          <View className="-ml-12 flex-1 -rotate-90 justify-center">
            <Text className="overflow-visible font-public-sans-bold text-xl text-placeholder">
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

          {data
            ?.toReversed()
            .slice(0, MAX_ITEMS + 1)
            .toReversed()
            .map((item, index) => {
              const enabled = index === Math.min(MAX_ITEMS, data.length - 1);
              const offset = 16 * (MAX_ITEMS - 1 - index);

              return (
                <View
                  key={item.id}
                  className="absolute"
                  style={{ paddingTop: offset, paddingLeft: offset }}
                >
                  {!enabled ? (
                    <CardBase className="bg-white">
                      <CardText>{item.description}</CardText>
                    </CardBase>
                  ) : (
                    <Card data={item} />
                  )}
                </View>
              );
            })}
        </View>
      </View>
    </SafeAreaView>
  );
}
