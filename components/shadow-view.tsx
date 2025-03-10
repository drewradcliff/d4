import clsx from "clsx";
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

import { colors } from "@/constants/colors";

export const ShadowView = forwardRef<
  View,
  ViewProps & { as?: React.ElementType }
>(({ as: Component = View, className, style, ...props }, ref) => (
  <Component
    className={clsx("border border-primary bg-background", className)}
    ref={ref}
    style={[
      {
        shadowOffset: { height: 1, width: 1 },
        shadowColor: colors.primary,
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      style,
    ]}
    {...props}
  />
));

ShadowView.displayName = "ShadowView";
