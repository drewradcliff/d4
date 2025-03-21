import FontAwesome6 from "@react-native-vector-icons/fontawesome6";

export function Icon(
  props: Omit<
    Extract<React.ComponentProps<typeof FontAwesome6>, { iconStyle: "solid" }>,
    "iconStyle"
  >,
) {
  return <FontAwesome6 {...props} iconStyle="solid" />;
}
