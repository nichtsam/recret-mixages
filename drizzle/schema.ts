import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  message: text("message").notNull(),
});
