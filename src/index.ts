export { }; // Required to override fetch

import { AzureManager } from "./controllers/AzureManager";
import { throwFatalError } from "./utils/display";
import { GitManager } from "./controllers/GitManager";

main()


async function main() {

    enum CommandType {
        create,
        edit
    }

    const commandArgument: string = process.argv[2]

    if (!(commandArgument in CommandType)) {
        throwFatalError('Invalid command line argument: ' + commandArgument + "\nAvailable arguments:\ncreate edit")
    }

    const commandType: CommandType = CommandType[commandArgument as keyof typeof CommandType]

    const azureManager = await AzureManager.createManager()

    switch (commandType) {
        case CommandType.create:
            await azureManager.createProject()
            await azureManager.initRepo()
            break
        case CommandType.edit:
            await azureManager.editProject()
            break
    }

}


