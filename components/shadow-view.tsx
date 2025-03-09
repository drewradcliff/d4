import clsx from "clsx";
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

import { colors } from "@/constants/Colors";

export const ShadowView = forwardRef<View, ViewProps>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
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
        className={clsx([
          "rounded-full border border-primary bg-background",
          className,
        ])}
      >
        {children}
      </View>
    );
  },
);

ShadowView.displayName = "ShadowView";
