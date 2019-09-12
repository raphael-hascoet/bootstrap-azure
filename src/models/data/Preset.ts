export enum Preset {
    node = "NodeJS",
    angular = "Angular",
    none = "None"
}

export function getPresetKey(preset: Preset) {
    const presetValues = Object.values(Preset) as Array<string>
    const presetIndex = presetValues.findIndex((presetValue) => preset === presetValue)
    return Object.keys(Preset)[presetIndex]
}