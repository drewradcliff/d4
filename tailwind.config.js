/** @satisfies {import("tailwindcss").Config} */
module.exports = /** @type {const} */ ({
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#150033",
        secondary: "#524d58",
        tabBackground: "#fde3ff",
        placeholder: "#9c99a0",

        background: {
          DEFAULT: "#faf7f5",
          do: "#dfffd5",
          decide: "#fdffda",
          delegate: "#cce5ff",
          delete: "#ffd5d5",
          white: "#ffffff",
        },
        foreground: {
          do: "#a3ff86",
          decide: "#e1e591",
          delegate: "#95c8ff",
          delete: "#ff9995",
        },
      },
      fontFamily: {
        "public-sans-extra-light": "PublicSans_200ExtraLight",
        "public-sans-light": "PublicSans_300Light",
        "public-sans-regular": "PublicSans_400Regular",
        "public-sans-bold": "PublicSans_700Bold",
      },
    },
  },
  plugins: [],
});
