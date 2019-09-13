const spawn = require('await-spawn');
const globby = require('globby');

import initCommands from '../resources/init-commands.json'

import { Preset, getPresetKey } from './../models/data/Preset';


export function presetHasInitCommands(preset: Preset): boolean {
    return Object.keys(initCommands).includes(getPresetKey(preset))
}

export async function initializeProject(destination: string, preset: Preset): Promise<Array<string>> {
    for (const commandStr of (initCommands as any)[getPresetKey(preset)]) {
        const [command, ...commandArguments] = commandStr.split(' ')
        const bl = await spawn(command, commandArguments, { cwd: destination })
    }

    const filesToAddAbsolute = await globby(['./**', './**/.*'], { cwd: destination, gitignore: true });
    const filesToAdd = filesToAddAbsolute.map((absolutePath: string) => absolutePath.replace(destination, ''))
    return filesToAdd
}