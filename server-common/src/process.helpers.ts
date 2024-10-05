import process from "process";
import { createLogger } from "@starter/common/dist/logger";
import { ValidationError } from "@starter/common/dist/errors";
import { noThrow } from "@starter/common/dist/object.helpers";
import sourceMaps from "source-map-support";
import { dumpError } from "./error.helpers.js";

type ApplicationMainHandler = () => Promise<number | void>;

const logger = createLogger();

const _modules = new Map<string, IApplicationModule>();
let _appName: string;

export async function appMain(handler: ApplicationMainHandler, config: RunApplicationMainOptions) {
    logger.debug("appMain");

    let exitCode = 0;
    let skipExitingMessage = false;
    const modules = config.modules || [];

    _appName = config.appName;

    logger.debug("Installing source map support");
    sourceMaps.install();

    try {
        for (const module of modules) {
            await loadApplicationModule(module);
        }

        logger.debug("Running handler");
        const retVal = await handler();

        if (typeof retVal == "number") {
            exitCode = retVal;
        }
    } catch (error: any) {
        dumpError(logger, "error", error, "processMain failed");
        exitCode = 1;

        if (error instanceof ValidationError) {
            skipExitingMessage = true;
        }
    }

    for (const module of Array.from(_modules.values()).concat([]).reverse()) {
        await noThrow(() => module.unload());
    }

    logger.info(process.uptime().toFixed(2) + " seconds");

    if (!skipExitingMessage) {
        logger.debug("Exiting with exit code: " + exitCode);
    }

    process.exit(exitCode);
}

export async function loadApplicationModules(modules: IApplicationModule[]) {
    logger.debug("loadApplicationModules", modules.length);

    for (const module of modules) {
        await loadApplicationModule(module);
    }
}

async function loadApplicationModule(module: IApplicationModule) {
    logger.debug("loadApplicationModule", module.name);

    const moduleName = module.name;
    if (_modules.has(moduleName)) {
        return;
    }

    //
    //  Set into map before calling load to prevent case
    //  of a double initialization of a module
    //
    _modules.set(moduleName, module);

    try {
        await module.load(_appName);
    } catch (err) {
        _modules.delete(moduleName);

        throw err;
    }
}

export interface RunApplicationMainOptions {
    appName: string;
    modules?: IApplicationModule[];
}

export interface IApplicationModule {
    get name(): string;
    load(appName: string): Promise<void>;
    unload(): Promise<void>;
}
