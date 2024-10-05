import process from "process";
import fs from "fs/promises";
import path from "path";
import { parseEnum } from "@starter/common/dist/string.helpers.js";
import { createModuleLogger, LogLevel } from "@starter/common/dist/logger.js";
import { getNearestFile, readJsonFile } from "./file.helpers.js";
import { IApplicationModule } from "./process.helpers.js";
import { EnvType } from "@starter/common/dist/envType.js";
import { ENVVAR_STARTER_ENV, ENVVAR_STARTER_LOGLEVEL } from "./envvars.js";

const logger = createModuleLogger("env");
let _env: StarterEnv;

export async function initEnv(appName: string, initialEnv?: Partial<StarterEnv>): Promise<StarterEnv> {
    logger.debug("initEnv");

    if (_env) {
        throw new Error("Env was already initialized");
    }

    const processEnv = process.env;

    const workspaceDirPath = await resolveWorkspaceDirPath();
    const isWorkspace = !!workspaceDirPath;

    //
    //  Under local machine we expect AIREYE_ENV=local to be defined so the call for SSM should only
    //  happen under dev/staging/prod envs
    //
    const envStr = await (async () => {
        let envStr = processEnv[ENVVAR_STARTER_ENV];
        if (envStr) {
            return envStr;
        }

        return EnvType.local;
    })();

    const version = await (async () => {
        const packageJsonFilePath = await getNearestFile((<any>require).main.path, "package.json");
        if (!packageJsonFilePath) {
            return null;
        }

        return (await readJsonFile(packageJsonFilePath)).version;
    })();

    const envType = parseEnum(EnvType, envStr);

    const logLevelStr =
        processEnv[ENVVAR_STARTER_LOGLEVEL + "_" + appName] ||
        processEnv[ENVVAR_STARTER_LOGLEVEL] ||
        initialEnv?.logLevel ||
        "info";
    const logLevel = parseEnum(LogLevel, logLevelStr);

    const nodeVersion = process.version;

    _env = {
        appName,
        isWorkspace,
        workspaceDirPath,
        type: envType,
        logLevel,
        version,
        nodeVersion,
    };

    logger.debugJson(_env);

    return _env;
}

export function getEnv(): StarterEnv {
    ensureEnv();

    return _env;
}

//
//  In some rare cases we don't want to throw an error when env is not loaded
//
export function tryGetEnv(): StarterEnv {
    return _env;
}

export function resolveEnvVar<K extends keyof StarterEnv, T>(field: K, val?: StarterEnv[K]): StarterEnv[K] {
    ensureEnv();

    const res = val !== undefined ? val : _env[field];
    return res;
}

function ensureEnv() {
    if (!_env) {
        throw new Error("env was not initialized. Did you call initEnv?");
    }
}

export async function resolveWorkspaceDirPath(cwd?: string): Promise<string|null> {
    logger.debug("resolveWorkspaceDirPath", cwd);

    cwd = cwd || process.cwd();
    let dirPath = cwd;

    while (true) {
        if (
            await fs
                .stat(path.resolve(dirPath, "workspace.json"))
                .then(() => true)
                .catch(() => false)
        ) {
            return dirPath;
        }

        const parentDir = path.dirname(dirPath);
        if (parentDir == dirPath) {
            return null;
        }

        dirPath = parentDir;
    }
}

export function getEnvVar(varName: string): string {
    const val = process.env[varName];
    if (!val) {
        throw new Error(`Could not get env var process.env.${varName}`);
    }

    return val;
}

export interface StarterEnv {
    //
    //  The name that is used for logging and SSM configuration
    //
    appName: string;

    type: EnvType;

    //
    //  version taken from package.json that is located next to require.main.filename
    //
    version: string;

    logLevel: LogLevel;

    //
    //  True, if running inside the workspace directory (or a sub directory)
    //  For example,
    //  Is true when ae is executed on a local machine in /c/aireye
    //  Is also true when running on ci machine in ~/aireye
    //  Is false when running inside a docker container or pm2 under /var/aireye
    //
    isWorkspace: boolean;

    //
    //  Is null when isWorkspace is false
    //
    workspaceDirPath: string|null;

    //
    //  NodeJS version taken from process.version
    //
    nodeVersion: string;
}

export class EnvModule implements IApplicationModule {
    readonly name = "env";

    constructor(private initialEnv?: Partial<StarterEnv>) {}

    async load(appName: string): Promise<void> {
        await initEnv(appName, this.initialEnv);
    }

    async unload(): Promise<void> {}
}
