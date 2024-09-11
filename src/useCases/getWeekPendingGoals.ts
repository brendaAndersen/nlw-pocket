import dayjs from "dayjs"
import { db } from "../db"
import { and, count, lte, gte, sql, eq } from "drizzle-orm"
import { goalCompletions, goals } from "../db/schema"
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

export async function getWeekPendingGoals (){
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const currentYear = dayjs().endOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        // contar apenas as metas da semana atual. A função 'lte' testa se o primeiro parâmetro é igual ou maior que o segundo
        db.select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createdAt: goals.createdAt
        }).from(goals).where(lte(goals.createdAt, lastDayOfWeek))
    )
    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db
        .select({
            goalId: goalCompletions.goaldId,
            completionCount: count(goalCompletions.id).as('completionsCount'),
        })
        .from(goalCompletions)
        .where(and(
            gte(goals.createdAt, firstDayOfWeek),
            lte(goals.createdAt, lastDayOfWeek),
        ))
        .groupBy(goalCompletions.goaldId)
    )
    const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeekFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        completionCount: sql`
            COALESCE()
        `
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek))

    return pendingGoals
}