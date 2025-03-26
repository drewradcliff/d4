import clsx from "clsx";
import { forwardRef } from "react";
import { Platform, View, ViewProps } from "react-native";

import { theme } from "@/tailwind.config";

type PaperProps = ViewProps & {
  as?: React.ElementType;
  elevation?: number;
};

export const Paper = forwardRef<View, PaperProps>(
  ({ as: Component = View, elevation = 4, ...props }, ref) => (
    <Component
      {...props}
      className={clsx("border-4 border-primary bg-background", props.className)}
      ref={ref}
      style={[
        {
          marginBottom: Platform.OS === "android" ? elevation : 0,
          boxShadow: [
            {
              color: theme.colors.primary,
              offsetX: elevation,
              offsetY: elevation,
            },
          ],
        },
        props.style,
      ]}
    />
  ),
);

Paper.displayName = "Paper";
