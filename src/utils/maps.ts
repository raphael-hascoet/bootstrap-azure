export function mapToObject(map: Map<any, any> | null): any {
    const obj = {}

    if (!!map) {
        for (const key of Array.from(map.keys())) {
            (obj as any)[key] = map.get(key)
        }
    }

    return obj
}