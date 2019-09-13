export enum Job {
    windows = "Windows",
    macos = "MacOS",
    linux = "Linux"
}

export function getJobKey(job: Job) {
    const jobValues = Object.values(Job) as Array<string>
    const jobIndex = jobValues.findIndex((jobValue) => job === jobValue)
    return Object.keys(Job)[jobIndex]
}