import { IAzureLoginInfos } from '../models/data/AzureLoginInfos';
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

async function getConfig(): Promise<Map<string, any> | null> {
    let configFileContent

    try {
        configFileContent = await readConfigFile('./bootstrap-config.json')
    } catch (err) {
        console.log("Could not read config file.")
        return null
    }

    const pipelineSteps: Map<string, any> = new Map(Object.entries(configFileContent))

    return pipelineSteps
}

export async function configIsSet(type: string): Promise<boolean> {
    const config = await getConfig()

    if (config === null) {
        return false
    }

    return Array.from(config.keys()).includes(type)
}

export async function getConfigsWithEnvVariables(): Promise<Array<string>> {
    return getConfigsWithKey('env-variables')
}

export async function getConfigsWithTemplateVariables(): Promise<Array<string>> {
    return getConfigsWithKey('template-variables')
}

async function getConfigsWithKey(key: string): Promise<Array<string>> {

    const config = await getConfig()

    if (config === null) {
        return []
    }

    const configsWithKey = Array.from(config.keys()).filter((configKey) => {
        return key in config.get(configKey)
    })

    return configsWithKey

}

export async function getEnvVariablesFromConfig(type: string): Promise<Map<string, any> | null> {

    const envVariablesJson = await getFromConfig('env-variables', type)

    if (envVariablesJson === null)
        return null

    return new Map(Object.entries(envVariablesJson))

}

export async function getTemplateVariablesFromConfig(type: string): Promise<Map<string, any> | null> {

    const templateVariablesJson = await getFromConfig('template-variables', type)

    if (templateVariablesJson === null)
        return null

    return new Map(Object.entries(templateVariablesJson))

}

async function getFromConfig(key: string, type: string): Promise<any> {
    const config = await getConfig() as Map<string, any>

    if (typeof config.get(type) === 'undefined')
        return null

    if (typeof config.get(type)[key] === 'undefined')
        return null

    const configContent = config.get(type)[key]

    return configContent
}
