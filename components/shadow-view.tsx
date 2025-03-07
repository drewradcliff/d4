import clsx from "clsx";
import { View, type ViewProps } from "react-native";

import { colors } from "@/constants/colors";

export function ShadowView({
  as: Component = View,
  className,
  style,
  ...props
}: ViewProps & { as?: React.ElementType }) {
  return (
    <Component
      className={clsx(["border border-primary bg-background", className])}
      style={[
        {
          shadowOffset: {
            height: 1,
            width: 1,
          },
          shadowColor: colors.primary,
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        style,
      ]}
      {...props}
    />
  );
}
