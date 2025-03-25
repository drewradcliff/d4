import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as WebBrowser from "expo-web-browser";
import { Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

import { Card, CardBase, CardText } from "@/components/card";
import { db } from "@/db/client";
import { theme } from "@/tailwind.config";

const LEARN_MORE_URL = "https://d4-landing-gamma.vercel.app/#how-it-works";
const MAX_ITEMS = 3;

export default function PrioritizeScreen() {
  const { data } = useLiveQuery(
    db.query.tasks.findMany({
      where: (tasks, { isNull }) => isNull(tasks.priority),
    }),
  );

  return (
    <>
      <View className="px-4 pb-4">
        <Text className="font-lexend-medium text-base text-secondary">
          Drag tasks to quadrants to prioritize.{" "}
          <Text
            className="underline"
            onPress={() => WebBrowser.openBrowserAsync(LEARN_MORE_URL)}
          >
            Learn more
          </Text>{" "}
          about Eisenhower Matrix.
        </Text>
      </View>

      <View className="mb-4 flex-1 overflow-hidden">
        {/* headings */}
        <View className="absolute w-full flex-row">
          <View className="flex-1">
            <Text className="text-center font-lexend-bold text-xl text-tertiary">
              Urgent
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-center font-lexend-bold text-xl text-tertiary">
              Not Urgent
            </Text>
          </View>
        </View>
        <View className="absolute h-full">
          <View className="-ml-12 flex-1 -rotate-90 justify-center">
            <Text className="overflow-visible font-lexend-bold text-xl text-tertiary">
              Important
            </Text>
          </View>
          <View className="-ml-12 flex-1 -rotate-90 justify-center">
            <Text className="overflow-visible font-lexend-bold text-xl text-tertiary">
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
              stroke={theme.colors.primary}
              strokeDasharray="10 5"
            >
              <Line x1="0" y1="0" x2="100%" y2="0" />
            </Svg>
          </View>
          <View className="absolute h-full">
            <Svg
              height="100%"
              width="1"
              stroke={theme.colors.primary}
              strokeDasharray="10 5"
            >
              <Line x1="0" y1="0" x2="0" y2="100%" />
            </Svg>
          </View>

          {data
            .toReversed()
            .slice(0, MAX_ITEMS + 1)
            .toReversed()
            .map((item, index) => {
              const enabled = index === Math.min(MAX_ITEMS, data.length - 1);
              const offset = 20 * (MAX_ITEMS - 1 - index);

              return (
                <View
                  key={item.id}
                  className="absolute"
                  style={{ paddingTop: offset, paddingLeft: offset }}
                >
                  {!enabled ?
                    <CardBase>
                      <CardText>{item.description}</CardText>
                    </CardBase>
                  : <Card task={item} />}
                </View>
              );
            })}
        </View>
      </View>
    </>
  );
}
