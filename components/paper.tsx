import clsx from "clsx";
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

import { theme } from "@/styles/theme";

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
          shadowColor: theme.colors.primary,
          shadowOffset: { height: elevation, width: elevation },
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        props.style,
      ]}
    />
  ),
);

Paper.displayName = "Paper";
