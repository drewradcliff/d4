import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

import * as schema from "@/db/schema";

export const expo = SQLite.openDatabaseSync("app.db", {
  enableChangeListener: true,
});

export const db = drizzle(expo, { schema, logger: true });
