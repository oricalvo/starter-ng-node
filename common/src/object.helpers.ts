export type Task<T> = () => Promise<T>;

declare var window: any;
declare var global: any;
export const GLOBAL = (typeof window !== "undefined" && window) || (typeof global !== "undefined" && global);

export async function noThrow(...tasks: Task<any>[]): Promise<void> {
    //
    //  allSettled does not throw
    //
    await Promise.allSettled(tasks.map(t => t()));
}

export function removeUndefinedFields<T>(obj: T): T {
    if (!obj) {
        return obj;
    }

    const res: any = {};
    for (const key in obj) {
        if (obj[key] === undefined) {
            continue;
        }

        res[key] = obj[key];
    }

    return res;
}
