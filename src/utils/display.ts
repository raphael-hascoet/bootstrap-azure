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

export function selectQuestion(question: string, answers: Array<string>): number {
    return readlineSync.keyInSelect(answers, question, { cancel: false })
}

export function selectMultipleQuestion(question: string, answers: Array<string>): Array<boolean> {

    const keyLimit = `$<1-${answers.length}> `

    let selected: Array<boolean> = answers.map(() => false)

    console.log(question + "\n")

    for (let i = 0; i <= answers.length + 1; i++)
        console.log()

    while (true) {
        let returns = ""
        for (let i = 0; i <= answers.length + 1; i++)
            returns += '\x1B[1A'

        let items = ""
        for (const key in answers) {
            const displayedItem = selected[key] ? '(X) ' + answers[key] : '( ) ' + answers[key]
            items += `[${parseInt(key) + 1}] ${displayedItem}\n`
        }

        console.log(returns + items)

        console.log('Select your choices (press SPACE to validate)')

        const key = readlineSync.keyIn('', { hideEchoBack: true, mask: '', limit: keyLimit });

        if (key === ' ') { break }
        else { selected[parseInt(key) - 1] = !selected[parseInt(key) - 1] }
    }

    console.log(selected)
    return selected

}

