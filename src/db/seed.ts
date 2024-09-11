import { client, db } from "."
import { goalCompletions, goals } from "./schema"
import dayjs from 'dayjs';
import { createId } from '@paralleldrive/cuid2';

async function seed(){
    await db.delete(goalCompletions)
    await db.delete(goals)

    const result = await db.insert(goals).values([
        { title: 'Admirar a vida', desiredWeeklyFrequency: 7 },
        { title: 'Estudar SpringBoot', desiredWeeklyFrequency: 6 },
    ]).returning() // retorna os dados inseridos

    const startOfWeek = dayjs().startOf('week');

    await db.insert(goalCompletions).values([
        { id: createId(), goaldId: 'goal-id-1', createdAt: startOfWeek.toDate() },
        { id: createId(), goaldId: 'goal-id-2', createdAt: startOfWeek.add(1, 'day').toDate() },
    ])
}

seed().finally(() => {
    client.end() // para fechar a conexão com o db
})

// aqui deleta-se primeiro a foreign key, que é dependente da goals