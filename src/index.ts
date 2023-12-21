import { Hono } from 'hono'
import { Bindings } from 'hono/types';
import { drizzle } from 'drizzle-orm/d1';
import { config, sensor, status, teacher, users } from './schema';
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
        updatedAt: teacher.updatedAt,
    })
    .from(teacher)
    .leftJoin(status, eq(teacher.statusId, status.id));
    return Response.json(result);
});

app.get('/status', async (c) => {
});

app.post('/sensors', async (c) => {
    const db = drizzle(c.env.DB);
    const param = await c.req.json<{deviceAddress: Number, value: Array<number>}>();
    console.log(param);
//    const sensorValues = c.req.param('value');
//    const teacherId = 2; // Mr.Taniguchi
    const teacherId = 1; // hoge
//    const configs = await db.select().from(config).where(eq(config.teacherId, teacherId));
    const sensors = await db.select().from(sensor).where(eq(sensor.teacherId, teacherId));
    sensors.forEach(async (sensorInfo, index) => {
        const res = await db.update(sensor)
            .set({value: param.value[index]})
            .where(eq(sensor.id, sensors[index].id));
    });
//    param.value.forEach(async (value, index) => {
//    });
//    return Response.json(result);
});

app.get('/config', async (c) => {
});

export default app