import { sql } from "drizzle-orm";
import { sqliteTable, index, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    description: text("description").notNull(),
    priority: text("priority", {
      enum: ["do", "delegate", "decide", "delete"],
    }),
    createdAt: text("created_at")
      .default(sql`(current_timestamp)`)
      .notNull(),
    completedAt: text("completed_at"),
  },
  (table) => [index("priority_idx").on(table.priority)],
);

export type Task = typeof tasks.$inferSelect;
