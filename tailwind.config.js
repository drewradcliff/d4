const colors = /** @type {const} */ ({
  white: "hsl(0, 0%, 100%)",
  red: "hsl(0, 80%, 67%)",
  yellow: "hsl(56, 80%, 67%)",
  green: "hsl(104, 80%, 67%)",
  blue: "hsl(200, 80%, 67%)",
  purple: "hsl(280, 80%, 67%)",
});

/** @satisfies {import("tailwindcss").Config} */
module.exports = /** @type {const} */ ({
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      ...colors,

      // light theme
      primary: "hsl(270, 32%, 10%)",
      secondary: "hsl(270, 16%, 33%)",
      tertiary: "hsl(270, 8%, 67%)",
      background: "hsl(24, 32%, 98%)",

      do: colors.green,
      decide: colors.yellow,
      delegate: colors.blue,
      delete: colors.red,
    },
    fontFamily: {
      "lexend-bold": "Lexend-Bold",
      "lexend-medium": "Lexend-Medium",
    },
    fontSize: {
      base: 16,
      sm: 20,
      md: 24,
      lg: 40,
    },
  },
  plugins: [],
});
