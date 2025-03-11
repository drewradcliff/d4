import clsx from "clsx";
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

import { theme } from "@/styles/theme";

type PaperProps = ViewProps & {
  as?: React.ElementType;
  elevation?: number;
};

export const Paper = forwardRef<View, PaperProps>(
  (
    { as: Component = View, className, elevation = 1, style, ...props },
    ref,
  ) => (
    <Component
      className={clsx("border border-primary bg-background", className)}
      ref={ref}
      style={[
        {
          shadowOffset: { height: elevation, width: elevation },
          shadowColor: theme.colors.primary,
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        style,
      ]}
      {...props}
    />
  ),
);

Paper.displayName = "Paper";
