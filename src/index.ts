import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from 'hono/types';
import { drizzle } from 'drizzle-orm/d1';
import { config, log, sensor, status, teacher, users } from './schema';
import { and, desc, eq, or } from 'drizzle-orm';
import { ConfigPack, ExConfigRecord, calculateError, toConfigPack, toConfigRecords } from './model/config';

/*
export interface Env {
    DB: D1Database;
}
*/
type Env = {
    DB: D1Database;
}

const app = new Hono<{Bindings: Env}>()

// Corsの設定は最初に書かないといけない
app.use(
    '/*',
    cors({
      origin: ['https://dokosen.pages.dev', 'https://doko-admin.pages.dev', 'http://localhost:5173'], // 本番と開発環境のURL
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    })
)

app.get('/', async (c) => {
    return new Response("hoge");
    const db = drizzle(c.env.DB);
    const result = await db.select().from(teacher).all();
    return Response.json(result);
});

app.get('/teachers', async (c) => {
    console.log(c.req);
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
    const timeStampNow: number = Math.floor(Date.now() / 1000); // set Unix Time (second)

    const check = await c.req.json<{isValidData: boolean, log: string}>();
    if(check.isValidData == false) {
        const res = await db.insert(log).values(
            {isValidData: 0, log: check.log, timeStamp: timeStampNow}
        );
        return new Response("ok");
    }

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

    const configs = toConfigPack(
        await db.select({
            statusId: config.statusId,
            teacherId: config.teacherId,
            sensorId: config.sensorId,
            configValue: config.configValue,
            status: status.status
        }).from(config)
        .leftJoin(status, eq(config.statusId, status.id))
        .where(eq(config.teacherId, teacherInfo[0].id)) as ExConfigRecord[]
    ).configs;
    /*
    const configs = toConfigPack(
        await db.select().from(config)
        .where(eq(config.teacherId, teacherInfo[0].id))
    ).configs;
    */
    console.log(configs);
    let currentStatus = 0
    let minError = Infinity;
    configs.forEach((config) => {
        const error = calculateError(config.values, param.value);
        console.log("error: " + error.toString())
        if(error < minError) {
            minError = error;
            currentStatus = config.statusId;
        }
    });
    console.log("status: " + currentStatus.toString())
    const res = await db.update(teacher).set({
        statusId: currentStatus,
        updatedAt: timeStampNow, // set Unix Time (second)
    }).where(eq(teacher.id, teacherInfo[0].id));

    const res_log = await db.insert(log).values(
        {deviceAddress: param.deviceAddress, isValidData: 1, log: check.log, timeStamp: timeStampNow},
    );

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
//    console.log("ほげほげ");
    const db = drizzle(c.env.DB);
//    console.log(c.req);
/*
    const param = 
        await c.req.json<{teacherId: number}>();
*/
    const query = c.req.query() as {teacherId: string};
    const teacherId = Number(query.teacherId);
    console.log(query);
    const configs = toConfigPack(
        await db.select({
            statusId: config.statusId,
            teacherId: config.teacherId,
            sensorId: config.sensorId,
            configValue: config.configValue,
            status: status.status
        }).from(config)
        .leftJoin(status, eq(config.statusId, status.id))
        .where(eq(config.teacherId, teacherId)) as ExConfigRecord[]
    );
    return Response.json(configs);
});

app.post('/config', async (c) => {
    const db = drizzle(c.env.DB);
//    console.log(c.req);

    const param = 
        await c.req.json<{teacherId: number, config: ConfigPack}>();
    console.log(param);
    const records = toConfigRecords(param.teacherId, param.config);
    console.log(records);
    if(records == null) {
        return
    } else {
        const r: D1Result<unknown>[] = [];
        records.forEach(async (configRecord, index) => {
            console.log("設定");
            const res = await db.update(config)
                .set({configValue: configRecord.configValue})
                .where(and(
                    eq(config.teacherId, configRecord.teacherId),
                    eq(config.statusId, configRecord.statusId),
                    eq(config.sensorId, configRecord.sensorId)
                ));
            console.log(res);
            r.push(res);
        });

        /*
        const del = await db.delete(config)
            .where(eq(config.teacherId, param.teacherId));
        const res = await db.insert(config).values(records);
        */
        return Response.json({hoge: r.toString()});
    }
    return new Response("ok");
});

app.get('/status', async (c) => {
});

app.get('/admin/status', async (c) => {
    const db = drizzle(c.env.DB);
    const query = c.req.query() as {teacherId: string};
    const teacherId = Number(query.teacherId);

    const teacherInfo = (await db.select().from(teacher).where(eq(teacher.id, teacherId)))[0];
    const sensors =  await db.select().from(sensor).where(eq(sensor.teacherId, teacherId));
    const logs = await db.select().from(log).orderBy(desc(log.timeStamp));
    
    return Response.json({
        teacherInfo: teacherInfo,
        sensors: sensors,
        logs: logs
    });
});

app.get('/admin/config', async (c) => {
    const db = drizzle(c.env.DB);
    const query = c.req.query() as {teacherId: string};
    const teacherId = Number(query.teacherId);

    const teacherInfo = (await db.select().from(teacher).where(eq(teacher.id, teacherId)))[0];
    const sensors =  await db.select().from(sensor).where(eq(sensor.teacherId, teacherId));
    /*
    const configs = toConfigPack(
        await db.select({
            statusId: config.statusId,
            teacherId: config.teacherId,
            sensorId: config.sensorId,
            configValue: config.configValue,
            status: status.status
        }).from(config)
        .leftJoin(status, eq(config.statusId, status.id))
        .where(eq(config.teacherId, teacherId)) as ConfigData[]
    );
    */
    
    return Response.json({
        teacherInfo: teacherInfo,
        sensors: sensors,
//        configs: configs,
    });
});

export default app