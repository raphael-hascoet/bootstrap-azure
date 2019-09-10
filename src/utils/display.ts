const readlineSync = require('readline-sync');

export function throwError(message: string) {
    console.error("Error: " + message)
}

export function throwFatalError(message: string) {
    throwError(message)
    process.exit()
}

export function displayList(list: Array<any>) {
    for (const elem of list) {
        console.log(elem)
    }
}

export function question(question: string, defaultAnswer?: string) {
    return readlineSync.question(question, { defaultInput: defaultAnswer })
}

export function YNquestion(question: string): boolean {
    return readlineSync.keyInYNStrict(question)
}

