import { createLogger } from "@starter/common/dist/logger";
import { delay } from "@starter/common/dist/promise.helpers";
import path from "path";
import { noThrow } from "@starter/common/dist/object.helpers";
import { lock } from "proper-lockfile";

const logger = createLogger("FileLocker");

export class FileLocker {
    release: (() => Promise<void>)|null = null;
    filePath: string;
    options: FileLockerOptions;

    constructor(filePath: string, options: FileLockerOptions) {
        this.filePath = path.resolve(filePath);
        this.options = {
            interval: 100,
            processName: process.pid.toString(),
            ...options,
        };
    }

    private async init() {
        const { timeout, interval, processName } = this.options;
        const before = new Date();

        while (true) {
            try {
                this.release = await lock(this.filePath, {
                    realpath: false,
                });

                break;
            } catch (err: any) {
                if (err.code == "ELOCKED") {
                    if (timeout) {
                        const now = new Date();
                        if (now.valueOf() - before.valueOf() > timeout) {
                            throw new Error("Timeout while waiting to acquire file lock: " + this.filePath);
                        }

                        //
                        //  Do not throw, wait a bit and try again
                        //
                        logger.debug(`Waiting for ${interval} before trying to lock file ${this.filePath} again`);
                        await delay(interval!);
                        continue;
                    }

                    throw new Error(`Process ${processName} Failed to acquire file lock: ${this.filePath}`);
                }

                throw err;
            }
        }

        logger.debug("Lock file was successfully created at: " + this.filePath);
    }

    async [Symbol.dispose]() {
        logger.debug("dispose");

        const release = this.release;

        this.release = null;

        if (release) {
            await noThrow(async () => {
                await release();
            });
        }
    }

    static async lock(filePath: string, options: FileLockerOptions): Promise<FileLocker> {
        logger.debug("lock", filePath);

        const locker = new FileLocker(filePath, options);
        await locker.init();
        return locker;
    }
}

export interface FileLockerOptions {
    processName?: string;
    timeout?: number;
    interval?: number;
}
