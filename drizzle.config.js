const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./db/schema.ts",
  out: "./db/drizzle",
});
