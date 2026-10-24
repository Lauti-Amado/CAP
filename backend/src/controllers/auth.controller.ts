import { Request, Response } from "express";
import * as authService from "../services/usuario.services";

export async function login(req: Request, res: Response) {
    const resultado = await authService.login(req.body);
    if (!resultado) return res.status(401).json({ error: "Credenciales inválidas" });
    
    //Para settear la cookie en la response (internamente hace un Set-Cookie)
    res.cookie("token", resultado.token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //Para evitar CSRF
        maxAge: 1000 * 60 * 60 * 24 * 30 //30 dias maximo
    });
    
    return res.json(resultado.usuario); //No se devuelve el token! Lo tiene el header de la response
}

export async function logout(req: Request, res: Response) {
    //Limpia la cookie (hace que cuando el cliente recibe la response, limpie el token)
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
}

export async function yo(req: Request, res: Response) {
    const usuario = await authService.findById(req.usuario!.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    
    return res.json(usuario);
}