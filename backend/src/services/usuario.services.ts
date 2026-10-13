import { prisma } from "../config/prisma";

import type { RegistroCorredor, Login } from "../validations/usuario.validations";
import type { PayloadToken, Usuario } from "../dtos/usuario.dto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } from "../config/env";

//Encontrar usuario por id
export async function findById(id: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: {
            roles: { include: { rolAdministrativo: true } },
            persona: { include: { corredor: true } }
        }
    });

    if (!usuario) return null;

    return {
        id: usuario.id,
        email: usuario.email,
        roles: usuario.roles.map(r => r.rolAdministrativo.rol),
        persona: usuario.persona,
    };
}

//Login
export async function login(datos: Login): Promise<{ token: string; usuario: Usuario } | null> {
    const usuario = await prisma.usuario.findUnique({
        where: { email: datos.email },
        include: {
            roles: { include: { rolAdministrativo: true } },
            persona: { include: { corredor: true } }
        },
        omit: { passwordHash: false }, //Por defecto no trae el passwordHash. El login lo necesita y por eso se pide
    });

    if (!usuario) return null;

    const coincide = await bcrypt.compare(datos.password, usuario.passwordHash);
    if (!coincide) return null;

    const roles = usuario.roles.map(r => r.rolAdministrativo.rol);

    const payload: PayloadToken = { id: usuario.id, roles: roles };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
        token,
        usuario: {
            id: usuario.id,
            email: usuario.email,
            roles: roles,
            persona: usuario.persona,
        }
    };
}