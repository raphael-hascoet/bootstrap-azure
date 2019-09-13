import { GitManager } from './../controllers/GitManager';
import { Preset, getPresetKey } from './../models/data/Preset';
const path = require('path')
const fs = require('fs-extra')

const sampleFolder = path.join(process.cwd(), "/sample-files/")

export async function getSamplePath(fileName: string, preset?: Preset) {

    let samplePath = ""

    let defaultSample: boolean = typeof preset === 'undefined' || preset === Preset.none

    let notDefaultFileExists: boolean = false

    if (!defaultSample) {
        samplePath = path.join(sampleFolder, getPresetKey(preset as Preset), fileName)
        notDefaultFileExists = await fs.pathExists(samplePath)
    }

    if (!notDefaultFileExists || defaultSample) {
        samplePath = path.join(sampleFolder, fileName)
    }

    return samplePath

}

export async function copyFromSamples(fileName: string, destination: string, preset: Preset) {
    await fs.copyFile(
        await getSamplePath(fileName, preset),
        destination + fileName
    )
}

export async function getSampleContent(fileName: string, preset?: Preset): Promise<string> {
    return await fs.readFile(await getSamplePath(fileName, preset), 'utf-8')
}