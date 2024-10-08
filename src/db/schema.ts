import { integer, timestamp, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from '@paralleldrive/cuid2';

export const goals = pgTable("goals", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	title: text("title").notNull(),
	desiredWeeklyFrequency: integer("desired_weekly_frequency").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const goalCompletions = pgTable('goal_completions', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => goals.id).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// No drizzle, verifica-se que é possível escrever queries mais complexas, sem escrever sql puro como no prisma.