const fs = require('fs-extra')

export async function writeFile(destination: string, content: string) {
    await fs.writeFile(destination, content)
}