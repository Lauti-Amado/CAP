//backend/src/errors/quitarPropioAdministrador.error.ts
import { BaseError } from "./base.error";

export class ErrorQuitarPropioAdministrador extends BaseError {
    readonly statusCode = 409;
    constructor(
        message: string = "No podés quitarte a vos mismo el rol de Administrador."
    ) {
        super(message);
    }
}