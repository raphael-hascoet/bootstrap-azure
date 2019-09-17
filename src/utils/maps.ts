export function mapToObject(map: Map<any, any>): any {
    const obj = {}

    for (const key of Array.from(map.keys())) {
        (obj as any)[key] = map.get(key)
    }

    return obj
}