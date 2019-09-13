import { writeFile } from "../../utils/files"

export class CompiledPipeline {
    private pathToCompiledFiles: Map<string, string>

    constructor(compiledFiles: Map<string, string>) {
        this.pathToCompiledFiles = compiledFiles
    }

    async writeFilesInDestination(destination: string) {
        for (const filePath of this.getFilePaths()) {
            await writeFile(destination + filePath, this.pathToCompiledFiles.get(filePath) as string)
        }
    }

    getFilePaths(): Array<string> {
        return Array.from(this.pathToCompiledFiles.keys())
    }
}