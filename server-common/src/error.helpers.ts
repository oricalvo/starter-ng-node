import { AxiosError } from "axios";
import { ValidationError } from "@starter/common/dist/errors.js";
import { anyToString } from "@starter/common/dist/string.helpers.js";
import { createModuleLogger, ILogger, logLine } from "@starter/common/dist/logger.js";
import { getEnv, tryGetEnv } from "./env.js";
import { EnvType } from "@starter/common/dist/envType.js";

const logger = createModuleLogger();

export function dumpError(logger: ILogger, logMethod: keyof ILogger, err: Error, message: string) {
    if (err instanceof ValidationError) {
        logLine(logger, logMethod, err.message);
        return;
    }

    const details = extractDetails(err);

    //
    //  Under local env we print the call stack in a separate console line, so it can be read easily (line breaks)
    //  On prod env we don't do that since we want the callstack to be located in the same line with the error details
    //
    const env = tryGetEnv();
    if (!env || env.type == EnvType.local) {
        const stack = details.stack;
        delete details.stack;

        logger[logMethod](message, JSON.stringify(details, undefined, 2));
        logger[logMethod](stack);
    } else {
        logLine(logger, logMethod, message + ". " + JSON.stringify(details));
    }
}

function extractDetails(err: any) {
    if (isSequelizeError(err)) {
        return extractSequelizeErrorDetails(err);
    }

    if (isAxiosError(err)) {
        return extractAxiosErrorDetails(err);
    }

    const nestedErr = err.errors && err.errors[0];
    if (nestedErr) {
        return extractDetails(nestedErr);
    }

    return extractBasicErrorDetails(err);
}

function extractStack(err: Error): string {
    if (!err.stack) {
        return "";
    }

    let stack = err.stack.toString();

    const message = err.message;
    if (message) {
        const firstLine = "Error: " + message;
        if (stack && message && stack.startsWith(firstLine)) {
            stack = stack.substring(firstLine.length);
        }
    }

    return stack;
}

function extractBasicErrorDetails(err: Error): ErrorDetails {
    const errMessage = err.message || "Unexpected error";
    const name = (err["name"] && err["name"].toLowerCase() != "error" && err["name"]) || undefined;

    return {
        message: errMessage,
        code: (<any>err).code,
        name,
        stack: extractStack(err),
    };
}

function dumpError_Basic(err: Error, message: string, ident: number) {
    const details = extractBasicErrorDetails(err);

    const env = getEnv();
    if (env.type == EnvType.local) {
        const stack = details.stack;
        delete details.stack;

        logger.error(message);
        logger.errorJson(details);

        if (stack) {
            logger.error(stack);
        }
    } else {
        logger.error(message + ". " + JSON.stringify(details), ident);
    }
}

function extractAxiosErrorDetails(err: AxiosError) {
    //
    //  Collect only fields that are interesting for us
    //
    const details: AxiosErrorDetails = {
        ...extractBasicErrorDetails(err),
        status: err.status!,
        responseData: err.response?.data,
    };

    return details;
}

function extractSequelizeErrorDetails(err: SequelizeDatabaseError): SequelizeErrorDetails {
    //
    //  Collect only fields that are interesting for us
    //
    const details: SequelizeErrorDetails = {
        ...extractBasicErrorDetails(err),
        sql: err.sql,
    };

    const parameters = err.parameters;
    if (parameters) {
        details.parameters = {};

        const keys = Object.keys(parameters);

        for (const key of keys) {
            details.parameters[key] = anyToString(parameters[key]);
        }
    }

    const original = err.original;
    if (original) {
        details.code = original.code;
        details.sqlState = original.sqlState;
        details.sqlMessage = original.sqlMessage;
    }

    return details;
}

export function isSequelizeError(err: any): err is SequelizeDatabaseError {
    if (err.name == "SequelizeDatabaseError") {
        return true;
    }

    if (err.sql && err.fields && err.parent) {
        return true;
    }

    return false;
}

function isAxiosError(err: any): err is AxiosError {
    if (err.name == "AxiosError") {
        return true;
    }

    return false;
}

interface SequelizeDatabaseError extends Error {
    name: "SequelizeDatabaseError";
    parent: SequelizeDatabaseErrorChild;
    original: SequelizeDatabaseErrorChild;
    sql: string;
    parameters: any;
}

interface SequelizeDatabaseErrorChild {
    code: string;
    errno: number;
    sqlState: string;
    sqlMessage: string;
    sql: string;
}

interface ErrorDetails {
    message: string;
    code?: string;
    name?: string;
    stack?: string;
}

interface SequelizeErrorDetails extends ErrorDetails {
    sql: string;
    parameters?: { [key: string]: string };
    sqlState?: string;
    sqlMessage?: string;
}

interface AxiosErrorDetails extends ErrorDetails {
    status: number;
    responseData: any;
}
