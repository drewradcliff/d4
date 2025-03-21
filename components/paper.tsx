import clsx from "clsx";
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

import { theme } from "@/tailwind.config";

type PaperProps = ViewProps & {
  as?: React.ElementType;
  elevation?: number;
};

export const Paper = forwardRef<View, PaperProps>(
  ({ as: Component = View, elevation = 1, ...props }, ref) => (
    <Component
      {...props}
      className={clsx("border border-primary bg-background", props.className)}
      ref={ref}
      style={[
        {
          boxShadow: [
            {
              offsetX: elevation,
              offsetY: elevation,
              blurRadius: 0,
              spreadDistance: 0,
              color: theme.colors.primary,
            },
          ],
        },
        props.style,
      ]}
    />
  ),
);

Paper.displayName = "Paper";
