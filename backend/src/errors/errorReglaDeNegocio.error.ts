//backend/src/errors/errorReglaDeNegocio.error.ts
import { BaseError } from "./base.error";

export class ErrorReglaDeNegocio extends BaseError {
    readonly statusCode = 409;
    constructor(message: string) {
        super(message);
    }
}