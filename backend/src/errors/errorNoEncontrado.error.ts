//backend/src/errors/errorNoEncontrado.error.ts
import { BaseError } from "./base.error";

export class ErrorNoEncontrado extends BaseError {
    readonly statusCode = 404;
    constructor(message: string = "Recurso no encontrado.") {
        super(message);
    }
}