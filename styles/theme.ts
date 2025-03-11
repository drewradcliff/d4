// see: https://v3.tailwindcss.com/docs/configuration#referencing-in-java-script

import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "@/tailwind.config.js";

export const { theme } = resolveConfig(tailwindConfig);
