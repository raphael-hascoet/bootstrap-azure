import { getSampleContent } from "./samples"

const Handlebars = require('handlebars')

export async function getCompiledTemplate(templateSource: string, content: object) {
    const template = Handlebars.compile(templateSource)
    return template(content)
}

export async function getContentFromInterface(interfaceObj: any): Promise<object> {

    let returnObj: any = {}

    const keys: Array<string> = Object.keys(interfaceObj)

    for (const key of keys) {
        const kebabKey = camelToKebab(key)
        returnObj[kebabKey] = await getSampleContent(getTemplateFilePath(kebabKey, interfaceObj[key]))
    }

    return returnObj
}

function camelToKebab(string: string): string {
    return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

export async function getTemplateFileContent(type: string, name: string) {
    return await getSampleContent(getTemplateFilePath(type, name))
}

function getTemplateFilePath(type: string, name: string) {
    return `azure-templates/${type}/${name}.yml`
}