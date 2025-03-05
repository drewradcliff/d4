import { View, ViewStyle } from "react-native";
import clsx from "clsx";
import { colors } from "@/constants/Colors";

export function ShadowView({
  className,
  style,
  children,
}: {
  className?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{
        shadowOffset: {
          height: 1,
          width: 1,
        },
        shadowColor: colors.primary,
        shadowOpacity: 1,
        shadowRadius: 0,
        ...style,
      }}
      className={clsx([
        "rounded-full border border-primary bg-background",
        className,
      ])}
    >
      {children}
    </View>
  );
}
