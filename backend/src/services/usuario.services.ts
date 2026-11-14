//backend/src/servies/usuario.services.ts
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";

import type { Login, LoginContingencia } from "../validations/usuario.validations";
import { consumir } from "./claveRespaldo.service";
import { TokenPayload, UsuarioDTO, toUsuarioDto } from "../dtos/usuario.dto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";

type UsuarioSesion = Parameters<typeof toUsuarioDto>[0];
type Sesion = { token: string; usuario: UsuarioDTO };

//Todo lo que necesita el DTO de sesión
const incluirSesion = {
    roles: { include: { rolAdministrativo: true } },
    persona: { include: { corredor: { include: { contactoEmergencia: true, aptosMedicos: true, afiliacion: true } } } },
} satisfies Prisma.UsuarioInclude;

//Firma el token y arma la respuesta de sesión (la usan todos los tipos de login)
function emitirSesion(usuario: UsuarioSesion): Sesion {
    const roles = usuario.roles.map(r => r.rolAdministrativo.rol);
    const payload: TokenPayload = { id: usuario.id, roles };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { token, usuario: toUsuarioDto(usuario) };
}

//Encontrar usuario por id
export async function findById(id: string): Promise<UsuarioDTO | null> {
    const usuario = await prisma.usuario.findUnique({ where: { id }, include: incluirSesion });
    if (!usuario) return null;

    return toUsuarioDto(usuario);
}

//Login
export async function login(datos: Login): Promise<Sesion | null> {
    const usuario = await prisma.usuario.findUnique({
        where: { email: datos.email },
        include: incluirSesion,
        omit: { passwordHash: false }, //Por defecto no trae el passwordHash. El login lo necesita y por eso se pide
    });
    if (!usuario) return null;

    const coincide = await bcrypt.compare(datos.password, usuario.passwordHash);
    if (!coincide) return null;

    return emitirSesion(usuario);
}

//Login de contingencia: email de la cuenta + clave de respaldo de uso único
export async function loginContingencia(datos: LoginContingencia): Promise<Sesion | null> {
    const usuario = await prisma.usuario.findUnique({
        where: { email: datos.email },
        include: incluirSesion,
    });
    if (!usuario || usuario.estado !== "Activo") return null;

    const consumida = await consumir(datos.clave, usuario.id);
    if (!consumida) return null;

    return emitirSesion(usuario);
}