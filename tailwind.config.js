import { colors } from "./constants/colors";

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: {
        "public-sans-extra-light": "PublicSans_200ExtraLight",
        "public-sans-light": "PublicSans_300Light",
        "public-sans-regular": "PublicSans_400Regular",
        "public-sans-bold": "PublicSans_700Bold",
      },
    },
  },
  plugins: [],
};
