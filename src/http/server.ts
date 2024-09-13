import fastify from "fastify";
import { createGoal } from "../useCases/createGoal";
import z from "zod";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { getWeekPendingGoals } from "../useCases/getWeekPendingGoals";
import { createGoalCompletion } from "../useCases/createGoalCompletion";
import { resourceLimits } from "worker_threads";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Validação das rotas
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.post('/goals', {
	schema:{
		body: z.object({
			title: z.string(),
			desiredWeeklyFrequency: z.number().int().min(1).max(2)
		})
	}
}, async(request) => {
	// const goals = createGoalSchema.parse(request.body);
	const { title, desiredWeeklyFrequency } = request.body;

	try{
		await createGoal({
		title,
		desiredWeeklyFrequency
	})}
	catch(err){
		console.log(err)
	}
})

app.post(
    '/completions',
    {
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async request => {
      const { goalId } = request.body

      await createGoalCompletion({
        goalId,
      })
    }
)

app.get('/pending-goals', {}, async () => {
    const { pendingGoals } = await getWeekPendingGoals()

    return { pendingGoals }
  })
app.listen({ port: 3333}).then(() => {
	console.log("HTTP server running 🚀");
});
