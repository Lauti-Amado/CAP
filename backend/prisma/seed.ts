import { prisma } from "../src/config/prisma";
import { Rol, Sexo, TipoDistancia } from "../src/generated/prisma/enums";
import bcrypt from "bcrypt";

const usuarios = [
    {
        email: "corredor@cap.test", 
        password: "Corredor1234", 
        rolesAdministrativos: [],
        persona: { dni: "22222222", nombre: "Bianca", apellido: "Petz", telefono: "2210000000" },
        corredor: { fechaNacimiento: new Date('2005-02-22'), sexo: Sexo.Femenino,
            contactoEmergencia: { dni: "99999999", nombre: "Kiara", apellido: "Petz", telefono: "2210000099" }
        }
    },
    { 
        email: "clasificador@cap.test", 
        password: "Clasificador1234", 
        rolesAdministrativos: [Rol.Clasificador],
        persona: { dni: "44444444", nombre: "Bianca", apellido: "Clasificadora", telefono: "2210000003" },
        corredor: null
    },
    { 
        email: "superadmin@cap.test", 
        password: "Superadmin1234", 
        rolesAdministrativos: [Rol.Administrador, Rol.Tesorero, Rol.Clasificador],
        persona: { dni: "00000000", nombre: "Cuca", apellido: "Cap", telefono: "2210000004" },
        corredor: null
    }
];

const localidades = [
    { codigoPostal: "1900", nombre: "La Plata" },
    { codigoPostal: "1923", nombre: "Berisso" },
    { codigoPostal: "1925", nombre: "Ensenada" }
];

const lugares = [
    { nombre: "Paseo del Bosque", localidadNombre: "La Plata" },
    { nombre: "Club Villa San Carlos", localidadNombre: "Berisso" }
];

const carreras = [
    { 
        nombre: "Las Tres Ciudades", 
        fechaHoraCarrera: new Date('2027-03-19T08:00:00.000Z'), 
        fechaHoraEntregaKits: new Date('2027-03-18T08:00:00.000Z'),
        imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8EjCtKb-4OPjBvQIZ2uHzh4WcEoBhY6XW1wCpQz4P8C61G18Nz3flBs4&s=10", 
        descripcion: "La Media Maratón mas antigua de la Provincia.", 
        participantesMax: 1500, 
        lugarNombre: "Paseo del Bosque"
    },
    { 
        nombre: "Maratón Villera", 
        fechaHoraCarrera: new Date('2027-06-22T08:00:00.000Z'),
        fechaHoraEntregaKits: new Date('2027-06-21T10:00:00.000Z'),
        imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScWSQ8Qa-Gq_f8YeoQRu2JVESzFOZJoUlTgii_QXdu5e7asJWpG5284I_G&s=10", 
        descripcion: "En el marco de los festejos por los 100 años del Club Atlético Villa San Carlos, la Maratón Villera!", 
        participantesMax: 500, 
        lugarNombre: "Club Villa San Carlos"
    }
];

const distancias = [
    { kilometraje: 21, tipoDistancia: TipoDistancia.Competitiva },
    { kilometraje: 21, tipoDistancia: TipoDistancia.Participativa },
    { kilometraje: 10, tipoDistancia: TipoDistancia.Competitiva },
    { kilometraje: 10, tipoDistancia: TipoDistancia.Participativa },
    { kilometraje: 5,  tipoDistancia: TipoDistancia.Competitiva },
    { kilometraje: 5,  tipoDistancia: TipoDistancia.Participativa },
];

const distanciasCarreras = [
    { fechaHoraCarrera: new Date('2027-03-19T08:00:00.000Z'), kilometraje: 21, tipoDistancia: TipoDistancia.Competitiva, precioDistancia: 30000 },
    { fechaHoraCarrera: new Date('2027-03-19T08:00:00.000Z'), kilometraje: 21, tipoDistancia: TipoDistancia.Participativa, precioDistancia: 20000 },
    { fechaHoraCarrera: new Date('2027-03-19T08:00:00.000Z'), kilometraje: 10, tipoDistancia: TipoDistancia.Competitiva, precioDistancia: 20000 },
    { fechaHoraCarrera: new Date('2027-03-19T08:00:00.000Z'), kilometraje: 10, tipoDistancia: TipoDistancia.Participativa, precioDistancia: 15000 },
    { fechaHoraCarrera: new Date('2027-06-22T08:00:00.000Z'), kilometraje: 5,  tipoDistancia: TipoDistancia.Competitiva, precioDistancia: 15000 },
    { fechaHoraCarrera: new Date('2027-06-22T08:00:00.000Z'), kilometraje: 5,  tipoDistancia: TipoDistancia.Participativa, precioDistancia: 15000 }
];

const productos = [
    {
        nombreProducto: "Remera Recicle Cross",
        imagenUrl: "/recursosHomeP/remeraRecicle.png",
        variantes: [
            { nombreVariante: "Talle XS", precio: 12500, stock: 50 },
            { nombreVariante: "Talle S", precio: 12500, stock: 50 },
            { nombreVariante: "Talle M", precio: 12500, stock: 50 },
            { nombreVariante: "Talle L", precio: 12500, stock: 50 },
            { nombreVariante: "Talle XL", precio: 12500, stock: 50 }
        ]
    },
    {
        nombreProducto: "Remera Atulp",
        imagenUrl: "/recursosHomeP/remeraAtulp.jpg",
        variantes: [
            { nombreVariante: "Talle XS", precio: 11000, stock: 50 },
            { nombreVariante: "Talle S", precio: 11000, stock: 50 },
            { nombreVariante: "Talle M", precio: 11000, stock: 50 },
            { nombreVariante: "Talle L", precio: 11000, stock: 50 },
            { nombreVariante: "Talle XL", precio: 11000, stock: 50 }
        ]
    },
    {
        nombreProducto: "Remera Carrera de la Mujer",
        imagenUrl: "/recursosHomeP/remeraMujer.png",
        variantes: [
            { nombreVariante: "Talle XS", precio: 12000, stock: 50 },
            { nombreVariante: "Talle S", precio: 12000, stock: 50 },
            { nombreVariante: "Talle M", precio: 12000, stock: 50 },
            { nombreVariante: "Talle L", precio: 12000, stock: 50 },
            { nombreVariante: "Talle XL", precio: 12000, stock: 50 }            
        ]
    }
];

async function main() {

    //Roles administrativos
    const rolesEnum = [Rol.Administrador, Rol.Tesorero, Rol.Clasificador];
    for (const rolName of rolesEnum) {
        const existeRol = await prisma.rolAdministrativo.findFirst({ where: { rol: rolName }});
        if (!existeRol) {
            await prisma.rolAdministrativo.create({ data: { rol: rolName } });
        }
    }

    //Usuarios
    for (const { password, persona, rolesAdministrativos, corredor, ...datos } of usuarios) {
        const passwordHash = await bcrypt.hash(password, 10);
        
        const usuarioCreado = await prisma.usuario.upsert({
            where: { email: datos.email },
            update: {},
            create: { 
                ...datos, 
                passwordHash,
                persona: { create: persona }
            },
            include: { persona: true } 
        });

        if (corredor) {
            const contacto = await prisma.persona.upsert({
                where: { dni: corredor.contactoEmergencia.dni },
                update: {},
                create: corredor.contactoEmergencia
            });

            await prisma.corredor.upsert({
                where: { personaId: usuarioCreado.personaId },
                update: {},
                create: {
                    fechaNacimiento: corredor.fechaNacimiento,
                    sexo: corredor.sexo,
                    personaId: usuarioCreado.personaId,
                    contactoEmergenciaId: contacto.id
                }
            });
        }

        if (rolesAdministrativos && rolesAdministrativos.length > 0) {
            for (const rolName of rolesAdministrativos) {
                const rolDb = await prisma.rolAdministrativo.findFirst({ where: { rol: rolName } });
                
                if (rolDb) {
                    const joinExists = await prisma.usuarioRol.findUnique({
                        where: { usuarioId_rolAdministrativoId: { usuarioId: usuarioCreado.id, rolAdministrativoId: rolDb.id } }
                    });
                    
                    if (!joinExists) {
                        await prisma.usuarioRol.create({
                            data: { usuarioId: usuarioCreado.id, rolAdministrativoId: rolDb.id }
                        });
                    }
                }
            }
        }
    }

    //Localidades y Lugares
    await prisma.localidad.createMany({ data: localidades });
    
    for (const lug of lugares) {
        await prisma.lugar.upsert({
            where: { nombre: lug.nombre },
            update: {},
            create: {
                nombre: lug.nombre,
                localidad: { connect: { nombre: lug.localidadNombre } }
            }
        });
    }

    //Carreras
    for (const { lugarNombre, ...datos } of carreras) {
        try {
            await prisma.carrera.upsert({
                where: { fechaHoraCarrera: datos.fechaHoraCarrera },
                update: {},
                create: {
                    ...datos,
                    lugar: { connect: { nombre: lugarNombre } },
                }
            });
        } catch (e) {
            console.error(`Error creando carrera ${datos.nombre}:`, e);
        }
    }

    //Distancias
    await prisma.distancia.createMany({ data: distancias });

    for (const dc of distanciasCarreras) {
        try {
            const carrera = await prisma.carrera.findUnique({ where: { fechaHoraCarrera: dc.fechaHoraCarrera } });
            const distancia = await prisma.distancia.findUnique({ where: { kilometraje_tipoDistancia: { kilometraje: dc.kilometraje, tipoDistancia: dc.tipoDistancia } } });

            if (carrera && distancia) {
                await prisma.distanciaCarrera.create({ 
                    data: {
                        precioDistancia: dc.precioDistancia,
                        idCarrera: carrera.id,
                        idDistancia: distancia.id
                    }
                });
            }
        } catch (e) {

        }
    }

    //Productos
    for (const prod of productos) {
        try {
            await prisma.producto.upsert({
                where: { nombreProducto: prod.nombreProducto },
                update: {},
                create: {
                    nombreProducto: prod.nombreProducto,
                    imagenUrl: prod.imagenUrl,
                    variantes: {
                        create: prod.variantes
                    }
                }
            });
        } catch (e) {

        }
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });