export enum ErrorCode {
    internalServerError = 1,
    notAuthorized = 2,
    abortRequest = 3,
    validation = 4,
    myNetworkExists = 101,
    myNetworkNotFound = 102,
    myNetworkHidden = 103,
    networkGroupAlreadyExists = 104,
    generatePostureLimitReached = 1000,
}

export class AirEyeError extends Error {
    constructor(public readonly message: string, public readonly errorCode: ErrorCode = ErrorCode.internalServerError) {
        super(message);
    }
}

export class ValidationError extends AirEyeError {
    constructor(message: string) {
        super(message, ErrorCode.validation);
    }
}

export class NotAuthorizedError extends AirEyeError {
    constructor() {
        super("User is not authorized to preform this action", ErrorCode.notAuthorized);
    }
}

export class AbortRequestedError extends AirEyeError {
    constructor() {
        super("Abort was requested by the user", ErrorCode.abortRequest);
    }
}

export class HttpError extends AirEyeError {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        errorCode: number = ErrorCode.internalServerError
    ) {
        super(message, errorCode);
    }
}

export class ArgumentNullError extends Error {
    constructor(argumentName: string) {
        super(`Missing argument '${argumentName}'`);
    }
}
