const fs = require('fs-extra')

export async function writeFile(destination: string, content: string) {
    await fs.ensureFile(destination)
    await fs.writeFile(destination, content)
}

export async function readConfigFile(path: string): Promise<any> {
    let fileData, fileContent = null

    try {
        fileData = await fs.readFile(path)
    } catch (err) {
        if (err.code = 'ENOENT') {
            console.log(path + " does not exist.")
        }
        throw (err)
    }

    try {
        fileContent = JSON.parse(fileData)
    } catch (err) {
        if (err.name = 'SyntaxError') {
            console.log(path + ' is not syntactically correct.')
        }
        throw (err)
    }

    return fileContent
}