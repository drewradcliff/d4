import clsx from "clsx";
import { Text, View } from "react-native";

type HeaderProps = React.ComponentProps<typeof View> & {
  heading: React.ReactNode;
  subheading?: React.ReactNode;
};

export function Header({
  children,
  className,
  heading,
  subheading,
  ...props
}: HeaderProps) {
  return (
    <View className={clsx("z-10 gap-2 p-6", className)} {...props}>
      <Text className="font-public-sans-bold text-5xl text-primary">
        {heading}
      </Text>
      {subheading && (
        <Text className="pt-1 font-public-sans-light text-secondary">
          {subheading}
        </Text>
      )}
      {children}
    </View>
  );
}
