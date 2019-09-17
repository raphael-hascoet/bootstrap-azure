import { writeFile } from "../../utils/files"

export class CompiledPipeline {
    private pathToCompiledFiles: Map<string, string>

    private stepsWithVariables: Array<string>

    constructor(compiledFiles: Map<string, string>, stepsWithVariables: Array<string>) {
        this.pathToCompiledFiles = compiledFiles
        this.stepsWithVariables = stepsWithVariables
    }

    async writeFilesInDestination(destination: string) {
        for (const filePath of this.getFilePaths()) {
            await writeFile(destination + filePath, this.pathToCompiledFiles.get(filePath) as string)
        }
    }

    getFilePaths(): Array<string> {
        return Array.from(this.pathToCompiledFiles.keys())
    }

    getStepsWithVariables(): Array<string> {
        return this.stepsWithVariables
    }
}