//backend/src/utils/claveRespaldo.util.ts
import crypto from "crypto";
import { CLAVES_RESPALDO_SECRET } from "../config/env";

const SECRETO = Buffer.from(CLAVES_RESPALDO_SECRET, "hex"); //32 bytes
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; //Sin 0/O/1/I para evitar confusiones al tipear

//Genera una clave con formato XXXX-XXXX
export function generarClave(): string {
    let clave = "";
    for (let i = 0; i < 8; i++) clave += ALFABETO[crypto.randomInt(ALFABETO.length)];
    return `${clave.slice(0, 4)}-${clave.slice(4)}`;
}

//Acepta minúsculas y con/sin guión: "k9x2m4p8" == "K9X2-M4P8"
function normalizar(clave: string): string {
    return clave.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

//Hash determinístico para buscar/validar la clave sin descifrar nada
export function hashearClave(clave: string): string {
    return crypto.createHmac("sha256", SECRETO).update(normalizar(clave)).digest("hex");
}

//Cifrado reversible para que el administrador pueda volver a ver la clave
export function cifrarClave(clave: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", SECRETO, iv);
    const cifrado = Buffer.concat([cipher.update(clave, "utf8"), cipher.final()]);
    return [iv, cipher.getAuthTag(), cifrado].map(b => b.toString("base64")).join(".");
}

export function descifrarClave(valor: string): string {
    const [iv, tag, cifrado] = valor.split(".").map(p => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", SECRETO, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString("utf8");
}