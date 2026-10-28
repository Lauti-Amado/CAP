import type { TokenPayload } from "../dtos/usuario.dto";

declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload;
        }
    }
}

export { };