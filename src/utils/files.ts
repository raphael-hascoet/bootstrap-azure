const fs = require('fs-extra')

export async function writeFile(destination: string, content: string) {
    await fs.ensureFile(destination)
    await fs.writeFile(destination, content)
}