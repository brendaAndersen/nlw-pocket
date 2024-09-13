import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { and, asc, count, eq, sql } from 'drizzle-orm'


dayjs.extend(weekOfYear)

export async function getWeekPendingGoals() {
  const currentYear = dayjs().year()
  const currentWeek = dayjs().week()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${goals.createdAt}) <= ${currentYear}`,
          sql`EXTRACT(WEEK FROM ${goals.createdAt}) <= ${currentWeek}`
        )
      )
  )

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goals.id,
        completionCount: count(goalCompletions.id).as('completionCount'), // common table expression: depois de criada, estruturada e utilizada, a CTE é apagada
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .groupBy(goals.id)
  )
  // const goalCompletionCounts = db.$with('goal_completion_counts').as(
  //   db
  //     .select({
  //       goalId: goalCompletions.goalId,
  //       completionCount: count(goalCompletions.id).as('completionCount'), // common table expression: depois de criada, estruturada e utilizada, a CTE é apagada
  //     })
  //     .from(goalCompletions)
  //     .where(
  //       and(
  //         gte(goalCompletions.createdAt, firstDayOfWeek),
  //         lte(goalCompletions.createdAt, lastDayOfWeek)
  //       )
  //     )
  //     .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
  //     .groupBy(goals.id)
  // )
  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount:
        sql/**/`COALESCE(${goalCompletionCounts.completionCount}, 0)` // COALESCE permite fazer um IF: caso goalCompletionCounts não exista, retorna como default um zero
        .mapWith( // pega o resultado do SQL e passa para a classe number para conversão de string em number
          Number
        ),
    })
    .from(goalsCreatedUpToWeek)
    .orderBy(asc(goalsCreatedUpToWeek.createdAt))
    .leftJoin(
      goalCompletionCounts,
      eq(goalsCreatedUpToWeek.id, goalCompletionCounts.goalId)
    ) 
    // left join, para o caso dos registros não existirem para x meta e ainda sim retornar outras metas
    // no inner join, se o usuário não completasse uma meta uma única vez, não iria retornar nenhuma

  return { pendingGoals } 
}