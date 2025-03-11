/** @satisfies {import("tailwindcss").Config} */
module.exports = /** @type {const} */ ({
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#150033",
        secondary: "#524d58",
        background: "#faf7f5",
        tabBackground: "#fde3ff",
        placeholder: "#9c99a0",

        do: "#dfffd5",
        decide: "#fdffda",
        delegate: "#cce5ff",
        delete: "#ffd5d5",

        doPrimary: "#a3ff86",
        decidePrimary: "#e1e591",
        delegatePrimary: "#95c8ff",
        deletePrimary: "#ff9995",
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
