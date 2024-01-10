
export interface Config {
    statusId: number;
    values: Array<number>;
}

export interface ConfigRecord {
    statusId: number;
    teacherId: number;
    sensorId: number;
    configValue: number;
}

export interface ExConfigRecord {
    statusId: number;
    teacherId: number;
    sensorId: number;
    configValue: number;
    status: string;
}
export interface ConfigPack {
    configs: Array<Config>;
    sensorIDs: Array<number>;
    statuses: Array<string>;
}

export function toConfigPack(configData: ExConfigRecord[]): ConfigPack {
    const configs = new Array<Config>();
    const sensorIDs = new Array<number>();
    const statuses = new Array<string>();
    
    configData.forEach((data, index) => {
        const statusId = data.statusId;

        const existingConfigIndex = configs.findIndex((config) => config.statusId === statusId);

        if (existingConfigIndex !== -1) {
          // If config with the same statusId exists, add the configValue to its values
          configs[existingConfigIndex].values.push(data.configValue);
        } else {
          // If config with the same statusId doesn't exist, create a new config
          configs.push({
            statusId: statusId,
            values: [data.configValue],
          });
        }

        if(sensorIDs.includes(data.sensorId) == false) {
            // sensorIDs にsensorIdが存在しないとき追加する
            sensorIDs.push(data.sensorId);
        }

        if(statuses.includes(data.status) == false) {
            // statuses にstatusが存在しないとき追加する
            statuses.push(data.status);
        }
    });

    return {
        configs,
        sensorIDs,
        statuses,
    };
}

export function calculateError(configValues: Array<number>, sensorValues: Array<number>): number {
    let error = 0;
    configValues.forEach((value, i) => {
//        console.log(sensorValues[i]);
        error += (value - sensorValues[i]) ** 2;
    });
    return error;
    /*
    let error = configValues.reduce((error, value, i) => {
        return error + (value - sensorValues[i]) ** 2;
    }, 0);
    */
}

export function toConfigRecords(teacherId: number, configPack: ConfigPack): ConfigRecord[] | null{
    const sensorIDs = configPack.sensorIDs;
    const configs = configPack.configs;
    const statuses = configPack.statuses;
    const recordNum = sensorIDs.length * statuses.length;
    const result: ConfigRecord[] = Array();

    configs.forEach((config)=>{
        sensorIDs.forEach((sensorId, index)=>{
            result.push({
                teacherId: teacherId,
                statusId: config.statusId,
                sensorId: sensorId,
                configValue: config.values[index],
            });
        });
    });
    
    if(result.length = recordNum) {
        return result;
    }

    return null;
}

//function isStatusExists()