import { Preset } from './../models/data/Preset';
import { getSampleContent } from "./samples"

const Handlebars = require('handlebars')

export async function getCompiledTemplate(templateSource: string, content: object) {
    const template = Handlebars.compile(templateSource)
    return template(content)
}

export async function getTemplateFileContent(name: string, type?: string, preset?: Preset) {
    return await getSampleContent(getTemplateFilePath(name, type), preset)
}

function getTemplateFilePath(name: string, type?: string) {
    if (!!type)
        return `azure-templates/${type}/${name}.yml`
    else
        return `azure-templates/${name}.yml`
}