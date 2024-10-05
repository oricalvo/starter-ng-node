import PQueue from "p-queue";
import PAll from "p-all";
import PMap from "p-map";
import { createLogger } from "./logger";

const logger = createLogger();

export type Task<T> = () => Promise<T>;

export interface Deferred<T> {
    promise: Promise<T>;
    resolve: (val: T) => void;
    reject: (err: Error) => void;
}

export function defer<T>(): Deferred<T> {
    let resolve: any, reject: any;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    const res: Deferred<T> = {
        promise,
        resolve,
        reject,
    };
    return res;
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//
//  A small wrapper around p-queue with solves 2 issues:
//  1 - Error thrown by a task are not caught by p-queue. Instead, this class catch any error any keep it in the _err
//      The error is than rethrowed every time the caller the interacting with ParallelQueue (add/onIdle)
//  2 - By default p-queue allows for unlimited number of pending tasks. ParallelQueue tries to enforce 0 pending tasks by calling
//      onEmpty before returning. Please note, that if the caller uses add without await than multiple tasks may be queued
//
export class ParallelQueue {
    private _queue: PQueue;
    private _err: Error|null = null;

    constructor(concurrency: number) {
        this._queue = new PQueue({ concurrency });
    }

    async add(task: ()=>Promise<void>) {
        if (this._err) {
            throw this._err;
        }

        this._queue.add(async () => {
            if (this._err) {
                //
                //  Do not run next task if previous has failed
                //
                return;
            }

            try {
                await task();
            } catch (err: any) {
                if (!this._err) {
                    //
                    //  Only keep the first errpr
                    //
                    this._err = err;
                }
            }
        });

        //
        //  The caller is expected to await the add function
        //  It means that if concurrency is 5, 5 tasks will be executed concurrently, the six task will be added and blocks on below line
        //  until one of the running tasks is completed and the siz task moves to running state thus emptying the queue
        //
        await this._queue.onEmpty();

        if (this._err) {
            throw this._err;
        }
    }

    async onIdle() {
        if (this._err) {
            throw this._err;
        }

        await this._queue.onIdle();

        if (this._err) {
            throw this._err;
        }
    }
}

export async function wasFulfilled<T>(promise: Promise<T>): Promise<boolean> {
    let fulfilled = false;

    await promise
        .then(function () {
            fulfilled = true;
        })
        .catch(function () {
            //
            //  Swallow error
            //
        });

    return fulfilled;
}

export async function wasRejected<T>(promise: Promise<T>): Promise<boolean> {
    let rejected = false;

    await promise.catch(function () {
        rejected = true;
    });

    return rejected;
}

export async function waitFor<T>(
    pred: () => Promise<T>,
    intervalMS: number,
    timeoutMS: number,
    operationId: string,
    checkNotExist: boolean = false
): Promise<T|null> {
    logger.info("Waiting for " + operationId);

    const begin = new Date();

    while (true) {
        const retVal = await pred();
        if (retVal) {
            if (checkNotExist) {
                throw new Error("Unexpected entity was created as part of operation: " + operationId);
            }

            return retVal;
        }

        const now = new Date();
        if (now.valueOf() - begin.valueOf() > timeoutMS) {
            if (checkNotExist) {
                //
                //  This is actually OK
                //
                return null;
            } else {
                throw new Error("Timeout while waiting for " + operationId);
            }
        }

        await delay(intervalMS);
    }
}

export type EventListener = (args: any[]) => void;

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

        function onError(err: any) {
            cleanup();
            reject(err);
        }

        function cleanup() {
            source.removeListener(eventName, onSuccess);
            if (rejectOnErrorEvent) {
                source.removeListener("error", onError);
            }
        }

        source.once(eventName, onSuccess);

        if (rejectOnErrorEvent) {
            source.once("error", onError);
        }
    });
}

export const pMap = PMap;
export const pAll = PAll;
