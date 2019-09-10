import { IAzureLoginInfos } from '../models/data/AzureLoginInfos';
const fs = require('fs');
const fsPromises = fs.promises;

import { AzureLoginInfos } from "../models/data/AzureLoginInfos";

export default async function getDefaultLoginsFromFile(): Promise<AzureLoginInfos> {
    let defaultLogins: IAzureLoginInfos

    let loginsFileData = null

    try {
        loginsFileData = await fsPromises.readFile('./azure-logins.json')
    } catch (err) {
        if (err.code = 'ENOENT') {
            console.log("The azure-logins.json file does not exist. No defaults set.")
            return new AzureLoginInfos()
        }
        throw (err)
    }

    try {
        defaultLogins = JSON.parse(loginsFileData)
    } catch (err) {
        if (err.name = 'SyntaxError') {
            console.log('The azure-logins.json file is not syntactically correct. No defaults set.')
            return new AzureLoginInfos()
        }
        throw (err)
    }

    return new AzureLoginInfos(defaultLogins)
}