import { TextInput, type TextInputProps } from "react-native";

import { theme } from "@/tailwind.config";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      autoCapitalize="none" // gen z mode
      cursorColor={theme.colors.primary} // android only
      placeholderTextColor={theme.colors.secondary}
      {...props}
    />
  );
}
