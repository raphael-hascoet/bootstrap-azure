const { spawn } = require('child_process');
const globby = require('globby');

import initCommands from '../resources/init-commands.json'

import { Preset, getPresetKey } from './../models/data/Preset';


export function presetHasInitCommands(preset: Preset): boolean {
    return Object.keys(initCommands).includes(getPresetKey(preset))
}

export async function initializeProject(destination: string, preset: Preset, exposedVariables: Map<string, string>): Promise<Array<string>> {
    for (const commandStr of (initCommands as any)[getPresetKey(preset)]) {
        let [command, ...commandArguments] = commandStr.split(' ')

        commandArguments = replaceVariables(commandArguments, exposedVariables)

        console.log('Executing command ' + commandStr + ':')
        console.log()

        await new Promise((resolve, reject) => {
            const child = spawn(command, commandArguments, { cwd: destination })

            child.stdout.on('data', (data: any) => {
                console.log(`${data}`);
            });

            child.stderr.on('data', (data: any) => {
                console.error(`Error: :\n${data}`);
            });

            child.on('exit', function (code: any, signal: any) {
                console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
                resolve()
            });

            child.on('error', function (code: any, signal: any) {
                console.log('child process error with ' +
                    `code ${code} and signal ${signal}`);
                reject()
            });

        })

    }

    const filesToAddAbsolute = await globby(['./**', './**/.*'], { cwd: destination, gitignore: true });
    const filesToAdd = filesToAddAbsolute.map((absolutePath: string) => absolutePath.replace(destination, ''))
    return filesToAdd
}

function replaceVariables(commandArguments: Array<string>, variables: Map<string, string>): Array<String> {

    let retArguments: Array<string> = []

    for (const argument of commandArguments) {
        const replacedArgument = argument.charAt(0) === '$' ? variables.get(argument.substring(1)) : argument
        retArguments.push(replacedArgument as string)
    }

    return retArguments
}