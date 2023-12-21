import { Hono } from 'hono'
import { Bindings } from 'hono/types';
import { drizzle } from 'drizzle-orm/d1';
import { status, teacher, users } from './schema';
import { eq } from 'drizzle-orm';

/*
export interface Env {
    DB: D1Database;
}
*/
type Env = {
    DB: D1Database;
}

const app = new Hono<{Bindings: Env}>()

app.get('/', async (c) => {
    return new Response("hoge");
    const db = drizzle(c.env.DB);
    const result = await db.select().from(teacher).all();
    return Response.json(result);
});

app.get('/teachers', async (c) => {
    /*
    const db = drizzle(c.env.DB);
    const result = await db.select().from(teacher).all();
    return Response.json(result);
    */

    const db = drizzle(c.env.DB);
    const result = await db.select({
        id: teacher.id,
        name: teacher.name,
        status: status.status,
    })
    .from(teacher)
    .leftJoin(status, eq(teacher.statusId, status.id));
    return Response.json(result);
});

app.get('/status', async (c) => {
});

app.get('/sensors', async (c) => {
});

app.get('/config', async (c) => {
});

export default app