import type { PayloadToken } from "../dtos/usuario.dto";

declare global {
    namespace Express {
        interface Request {
            usuario?: PayloadToken;
        }
    }
}

export { };