import { Hono } from 'hono'
import { Bindings } from 'hono/types';
import { drizzle } from 'drizzle-orm/d1';
import { config, sensor, status, teacher, users } from './schema';
import { eq } from 'drizzle-orm';
import { calculateError, toConfigs } from './model/config';

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

app.post('/sensors', async (c) => {
    const db = drizzle(c.env.DB);
//    console.log(c.req);
    const param = 
        await c.req.json<{deviceAddress: number, value: Array<number>}>();
    console.log(param);
//    const sensorValues = c.req.param('value');
    const teacherInfo = await db.select().from(teacher).where(eq(teacher.deviceAddress, param.deviceAddress));
    const sensors =  await db.select().from(sensor).where(eq(sensor.teacherId, teacherInfo[0].id));
    sensors.forEach(async (sensorInfo, index) => {
        const res = await db.update(sensor)
            .set({value: param.value[index]})
            .where(eq(sensor.id, sensors[index].id));
    });

    const configs = toConfigs(
        await db.select().from(config)
        .where(eq(config.teacherId, teacherInfo[0].id))
    );
    console.log(configs);
    let status = 0
    let minError = Infinity;
    configs.forEach((config) => {
        const error = calculateError(config.values, param.value);
        console.log("error: " + error.toString())
        if(error < minError) {
            minError = error;
            status = config.statusId;
        }
    });
    console.log("status: " + status.toString())
    const res = await db.update(teacher).set({
        statusId: status,
        updatedAt: Math.floor(Date.now() / 1000), // set Unix Time (second)
    }).where(eq(teacher.id, teacherInfo[0].id));

    const newSensors = await db.select().from(sensor).where(eq(sensor.teacherId, teacherInfo[0].id));
    let sensorStatusMessage = ''; 
    newSensors.forEach((sensorInfo) => {sensorStatusMessage += sensorInfo.value.toString() + ' '});
//        newSensors[0].value.toString() + ' ' + 
//        newSensors[1].value.toString() + ' ' + 
//        newSensors[2].value.toString() + ' ' + 
//        newSensors[3].value.toString() + ' ' ;
    console.log(sensorStatusMessage);
    return new Response(sensorStatusMessage);
//    return new Response("OK");
//    param.value.forEach(async (value, index) => {
//    });
//    return Response.json(result);
});

app.get('/sensors', async (c) => {
    console.log("ほげ");
    const db = drizzle(c.env.DB);
    /*
    const res = db.insert(sensor).values([
        {id: 1, teacherId: 1, value: 2000},
        {id: 2, teacherId: 1, value: 2000},
        {id: 3, teacherId: 1, value: 2000},
        {id: 4, teacherId: 1, value: 2000},
    ])
    */
    const result = await db.select()
    .from(sensor).all();
    return Response.json(result);
});

app.get('/config', async (c) => {
});

app.get('/status', async (c) => {
});

export default app