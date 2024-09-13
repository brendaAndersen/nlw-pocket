import { db } from "../db";
import { goalCompletions } from "../db/schema";
import { and, count, gte, lte, eq, sql } from "drizzle-orm";
import dayjs from "dayjs";

interface CreateGoalCompletionRequest {
    goalId: string;
} 

export async function createGoalCompletion({ goalId }: CreateGoalCompletionRequest){
  const result = await db
  .insert(goalCompletions)
  .values({
    id: "",
    goalId,
    createdAt: new Date() 
  })
  .returning()

  const goalCompletion = result[0]

  return {
    goalCompletion,
  }
}