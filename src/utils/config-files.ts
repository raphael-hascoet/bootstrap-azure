import { IAzureLoginInfos } from '../models/data/AzureLoginInfos';
const fs = require('fs-extra');

import { AzureLoginInfos } from "../models/data/AzureLoginInfos";
import { readConfigFile } from './files';

export async function getDefaultLoginsFromFile(): Promise<AzureLoginInfos> {
    let defaultLogins: IAzureLoginInfos

    try {
        defaultLogins = await readConfigFile('./azure-logins.json')
    } catch (err) {
        console.log("No default set.")
        defaultLogins = new AzureLoginInfos()
    }

    return new AzureLoginInfos(defaultLogins)
}

export async function getConfig(type: string): Promise<any> {
    let configFileContent

    try {
        configFileContent = await readConfigFile('./bootstrap-config')
    } catch (err) {
        console.log("Could not read config file.")
        return null
    }

    if (configFileContent[type] === undefined) {
        console.log(`The ${type} config is not set.`)
        return null
    }

    return configFileContent[type]
}