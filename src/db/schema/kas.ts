import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const kasTransactionType = pgEnum("kas_transaction_type", ["in", "out"]);

export const kasTransactions = pgTable("kas_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date", { mode: "date" }).notNull(),
  description: text("description").notNull(),
  type: kasTransactionType("type").notNull(),
  amount: integer("amount").notNull(), // Rupiah, whole numbers, always positive
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
