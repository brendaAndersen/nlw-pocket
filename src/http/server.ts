import fastify from "fastify";
import { createGoal } from "../useCases/createGoal";
import z from "zod";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { getWeekPendingGoals } from "../useCases/getWeekPendingGoals";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Validação das rotas
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async () => {
	const sql = await getWeekPendingGoals();

	return sql
})

app.post('/goals', {
	schema:{
		body: z.object({
			title: z.string(),
			desiredWeeklyFrequency: z.number().int().min(1).max(2)
		})
	}
}, async(request) => {
	// const goals = createGoalSchema.parse(request.body);

	await createGoal({
		title: request.body.title,
		desiredWeeklyFrequency: request.body.desiredWeeklyFrequency
	})
})

app.listen({ port: 3333}).then(() => {
	console.log("HTTP server running 🚀");
});
