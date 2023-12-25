
export interface Config {
    statusId: number;
    values: Array<number>;
}

export function toConfigs(configData:{
    statusId: number;
    teacherId: number;
    sensorId: number;
    configValue: number;
}[]): Array<Config> {
    const configs = new Array<Config>();
    
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
    });

    return configs;
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

//function isStatusExists()