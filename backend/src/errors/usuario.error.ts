import { BaseError } from "./base.error";

export class ErrorDniDuplicado extends BaseError {
    readonly statusCode = 409;
    constructor(
        message: string = "Este DNI ya está en uso."
    ) {
        super(message);
    }
}