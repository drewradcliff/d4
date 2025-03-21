const colors = /** @type {const} */ ({
  white: "#ffffff",
  red: "#eb5252",
  yellow: "#efe368",
  green: "#71ef68",
  blue: "#68b9ef",
  purple: "#d086e9",
});

/** @satisfies {import("tailwindcss").Config} */
module.exports = /** @type {const} */ ({
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      ...colors,

      // light theme
      primary: "#19181b",
      secondary: "#524d58",
      tertiary: "#bfbbc3",
      background: "#f9f7f4",

      do: colors.green,
      decide: colors.yellow,
      delegate: colors.blue,
      delete: colors.red,
    },
    fontFamily: {
      "lexend-bold": "Lexend-Bold",
      "lexend-medium": "Lexend-Medium",
    },
  },
  plugins: [],
});
