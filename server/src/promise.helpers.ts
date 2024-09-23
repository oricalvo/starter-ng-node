//
//  Do not use NodeJS EventEmitter since it is writable and since we do not want NodeJS depenedency in common
//
export interface EventEmitterSource {
    removeListener(eventName: string, listener: EventListener): void;
    once(eventName: string, listener: EventListener): void;
}

export function waitForEvent<T>(
    source: EventEmitterSource,
    eventName: string,
    rejectOnErrorEvent: boolean = true
): Promise<T> {
    if (!source) {
        return Promise.resolve(<T>null);
    }

    return new Promise((resolve, reject) => {
        function onSuccess(res: any) {
            cleanup();
            resolve(res);
        }

        function onError(err: Error): void {
            cleanup();
            reject(err);
        }

        function cleanup() {
            source.removeListener(eventName, onSuccess);
            if (rejectOnErrorEvent) {
                source.removeListener("error", <any>onError);
            }
        }

        source.once(eventName, onSuccess);

        if (rejectOnErrorEvent) {
            source.once("error", <any>onError);
        }
    });
}

export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
