import { Hono } from 'hono'
import { Bindings } from 'hono/types';
import { drizzle } from 'drizzle-orm/d1';
import { teacher, users } from './schema';

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
    const db = drizzle(c.env.DB);
    const result = await db.select().from(teacher).all();
    return Response.json(result);
});

export default app