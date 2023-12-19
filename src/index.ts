import { Hono } from 'hono'
import { Bindings } from 'hono/types';

export interface Env {
    DB: D1Database;
}

const app = new Hono<{Bindings: Env}>()

app.get('/', (c) => c.text('Hello Hono!'))

export default app
