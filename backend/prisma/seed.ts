import { prisma } from "../src/config/prisma";
import { Rol, Sexo, TipoDistancia, EstadoCarrera, EstadoInscripcion,} from "../src/generated/prisma/client";
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
        email: "admin@cap.test", 
        password: "Admin1234", 
        rolesAdministrativos: [Rol.Administrador, Rol.Clasificador],
        persona: { dni: "21212121", nombre: "Bianca", apellido: "Petz", telefono: "2210000022" },
        corredor: null
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
        lugarNombre: "Paseo del Bosque",
        estado: EstadoCarrera.Activa,
    },
    { 
        nombre: "Maratón Villera", 
        fechaHoraCarrera: new Date('2027-06-22T08:00:00.000Z'),
        fechaHoraEntregaKits: new Date('2027-06-21T10:00:00.000Z'),
        imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScWSQ8Qa-Gq_f8YeoQRu2JVESzFOZJoUlTgii_QXdu5e7asJWpG5284I_G&s=10", 
        descripcion: "En el marco de los festejos por los 100 años del Club Atlético Villa San Carlos, la Maratón Villera!", 
        participantesMax: 500, 
        lugarNombre: "Club Villa San Carlos",
        estado: EstadoCarrera.Entrega_kits,
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

// Ajustar a la realidad del CAP
const rangosEdad = [
  "14 a 17", "18 a 24", "25 a 29", "30 a 34", "35 a 39", "40 a 44",
  "45 a 49", "50 a 54", "55 a 59", "60 a 64", "65 a 69", "70 a 99",
];

async function seedCategorias() {
   // Categoría de rangos de edad (si ya existe, solo se agregan los rangos que falten)
  const edadExistente = await prisma.categoria.findFirst({
    where: { nombre: "Edad CAP" },
    include: { criterios: true },
  });

  if (!edadExistente) {
    await prisma.categoria.create({
      data: {
        nombre: "Edad CAP",
        descripcion: "Clasificación por rango de edad (cada 5 años).",
        criterios: { create: rangosEdad.map((valor) => ({ nombre: "edad", valor })) },
      },
    });
  } else {
    const cargados = new Set(edadExistente.criterios.map((c) => c.valor));
    const faltantes = rangosEdad.filter((valor) => !cargados.has(valor));
    if (faltantes.length > 0) {
      await prisma.criterioCategoria.createMany({
        data: faltantes.map((valor) => ({ nombre: "edad", valor, categoriaId: edadExistente.id })),
      });
    }
  }

    // Categoría de sexo: la "general" separada en masculino y femenino
  const sexoExistente = await prisma.categoria.findFirst({ where: { nombre: "Sexo" } });

  if (!sexoExistente) {
    await prisma.categoria.create({
      data: {
        nombre: "Sexo",
        descripcion: "Clasificación general separada por sexo.",
        criterios: {
          create: [
            { nombre: "sexo", valor: Sexo.Masculino },
            { nombre: "sexo", valor: Sexo.Femenino },
          ],
        },
      },
    });
  }

  // Categoría de discapacidades
  const discapacidadesExistente = await prisma.categoria.findFirst({
    where: { nombre: "Discapacidades" },
  });

  if (!discapacidadesExistente) {
    await prisma.categoria.create({
      data: {
        nombre: "Discapacidades",
        descripcion: "Clasificación por tipo de discapacidad.",
        criterios: {
          create: [
            {
              nombre: "Discapacidad general",
              valor: "Discapacidad_general",
            },
            {
              nombre: "Discapacidad visual",
              valor: "Discapacidad_visual",
            },
            {
              nombre: "Discapacidad silla",
              valor: "Discapacidad_silla",
            },
          ],
        },
      },
    });
  }
}

async function main() {
    await seedCategorias();

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
    for (const localidad of localidades) {
        await prisma.localidad.upsert({
            where: { nombre: localidad.nombre },
            update: {},
            create: localidad,
        });
        }

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
                update: { estado: datos.estado },
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
    for (const distancia of distancias) {
        await prisma.distancia.upsert({
            where: {
            kilometraje_tipoDistancia: {
                kilometraje: distancia.kilometraje,
                tipoDistancia: distancia.tipoDistancia,
            },
            },
            update: {},
            create: distancia,
        });
        }
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
    // Inscripción de prueba para Entrega de Kits
    const corredor = await prisma.corredor.findFirst({
    where: {
        persona: {
        dni: "22222222",
        },
    },
    });

    const carrera = await prisma.carrera.findFirst({
    where: {
        nombre: "Maratón Villera",
    },
    });

    const distanciaCarrera = carrera
    ? await prisma.distanciaCarrera.findFirst({
        where: {
            idCarrera: carrera.id,
            distancia: {
            kilometraje: 5,
            tipoDistancia: TipoDistancia.Competitiva,
            },
        },
        })
    : null;

    const usuarioAdmin = await prisma.usuario.findUnique({
    where: {
        email: "admin@cap.test",
    },
    });

    if (corredor && carrera && distanciaCarrera && usuarioAdmin) {
    const inscripcionExistente = await prisma.inscripcion.findFirst({
        where: {
        idCorredor: corredor.id,
        distanciaCarrera: {
            idCarrera: carrera.id,
        },
        },
        include: {
        detalleCompra: true,
        },
    });

    if (inscripcionExistente) {
        await prisma.compra.update({
        where: { id: inscripcionExistente.detalleCompra.idCompra },
        data: { isPagado: true },
        });

        await prisma.inscripcion.update({
        where: { id: inscripcionExistente.id },
        data: { estado: EstadoInscripcion.Pagada },
        });
    } else {
        const compra = await prisma.compra.create({
        data: {
            montoTotal: distanciaCarrera.precioDistancia,
            metodoPago: "Pago_virtual",
            usuarioId: usuarioAdmin.id,
        }, include: { detallesCompra: true }
        });

        const detalleCompra = await prisma.detalleCompra.create({
            data: {
                descripcion: "Inscripcion",
                monto: distanciaCarrera.precioDistancia,
                cantidad: 1,
                idCompra: compra.id
            }
        })

        await prisma.inscripcion.create({
        data: {
            idDetalleCompra: detalleCompra.id,
            idCorredor: corredor.id,
            idCarrera: distanciaCarrera.idCarrera,
            idDistancia: distanciaCarrera.idDistancia,
            estado: EstadoInscripcion.Pagada,
        },
        });
    }

    console.log("Inscripción de prueba para Entrega de Kits creada/verificada.");
    } else {
    console.error("No se pudo crear la inscripción de prueba: faltan datos relacionados.");
    }

    // Corredor de prueba para validar entrega de kits (sin usuario)
    const personaLucas = await prisma.persona.upsert({
        where: { dni: "33333333" },
        update: {},
        create: {
            dni: "33333333",
            nombre: "Lucas",
            apellido: "Gómez",
            telefono: "2210000033",
        },
    });

    const contactoLucas = await prisma.persona.upsert({
        where: { dni: "88888888" },
        update: {},
        create: {
            dni: "88888888",
            nombre: "Pedro",
            apellido: "Gómez",
            telefono: "2210000088",
        },
    });

    const corredorLucas = await prisma.corredor.upsert({
        where: { personaId: personaLucas.id },
        update: {},
        create: {
            fechaNacimiento: new Date("2000-05-15"),
            sexo: Sexo.Masculino,
            personaId: personaLucas.id,
            contactoEmergenciaId: contactoLucas.id,
        },
    });

    // Inscripción paga de Lucas en Maratón Villera
    if (carrera && distanciaCarrera && usuarioAdmin) {
        const inscripcionLucas = await prisma.inscripcion.findFirst({
            where: {
                idCorredor: corredorLucas.id,
                distanciaCarrera: { idCarrera: carrera.id },
            },
            include: { detalleCompra: true },
        });

        if (inscripcionLucas) {
            await prisma.compra.update({
                where: { id: inscripcionLucas.detalleCompra.idCompra },
                data: { isPagado: true },
            });

            await prisma.inscripcion.update({
                where: { id: inscripcionLucas.id },
                data: { estado: EstadoInscripcion.Pagada },
            });
        } else {
            const compraLucas = await prisma.compra.create({
                data: {
                    montoTotal: distanciaCarrera.precioDistancia,
                    estado: "Pagada",
                    usuarioId: usuarioAdmin.id,
                    metodoPago: "Pago_virtual"
                }, include: { detallesCompra: true }
            });

            const detalleCompraLucas = await prisma.detalleCompra.create({
            data: {
                descripcion: "Inscripcion",
                monto: distanciaCarrera.precioDistancia,
                cantidad: 1,
                idCompra: compraLucas.id
                }
            })

            await prisma.inscripcion.create({
                data: {
                    idDetalleCompra: detalleCompraLucas.id,
                    idCorredor: corredorLucas.id,
                    idCarrera: distanciaCarrera.idCarrera,
                    idDistancia: distanciaCarrera.idDistancia,
                    estado: EstadoInscripcion.Pagada,
                },
            });
        }

        console.log("Inscripción de Lucas creada/verificada.");
    }

    // Corredora de prueba para validar que no se entregue el kit si no pagó
    const personaMartina = await prisma.persona.upsert({
        where: { dni: "44444444" },
        update: {},
        create: {
            dni: "44444444",
            nombre: "Martina",
            apellido: "López",
            telefono: "2210000044",
        },
    });

    const contactoMartina = await prisma.persona.upsert({
        where: { dni: "77777777" },
        update: {},
        create: {
            dni: "77777777",
            nombre: "Laura",
            apellido: "López",
            telefono: "2210000077",
        },
    });

    const corredorMartina = await prisma.corredor.upsert({
        where: { personaId: personaMartina.id },
        update: {},
        create: {
            fechaNacimiento: new Date("2001-08-12"),
            sexo: Sexo.Femenino,
            personaId: personaMartina.id,
            contactoEmergenciaId: contactoMartina.id,
        },
    });

    // Inscripción impaga de Martina en Maratón Villera
    if (carrera && distanciaCarrera && usuarioAdmin) {
        const inscripcionMartina = await prisma.inscripcion.findFirst({
            where: {
                idCorredor: corredorMartina.id,
                distanciaCarrera: { idCarrera: carrera.id },
            }, include: { detalleCompra: true }
        });

        if (inscripcionMartina) {
            await prisma.compra.update({
                where: { id: inscripcionMartina.detalleCompra.id },
                data: { isPagado: false },
            });

            await prisma.inscripcion.update({
                where: { id: inscripcionMartina.id },
                data: { estado: EstadoInscripcion.En_proceso },
            });
        } else {
            const compraMartina = await prisma.compra.create({
                data: {
                    montoTotal: distanciaCarrera.precioDistancia,
                    usuarioId: usuarioAdmin.id,
                    metodoPago: "Pago_virtual"
                },
            });

            const detalleCompraMartina = await prisma.detalleCompra.create({
            data: {
                descripcion: "Inscripcion",
                monto: distanciaCarrera.precioDistancia,
                cantidad: 1,
                idCompra: compraMartina.id
                }
            })

            await prisma.inscripcion.create({
                data: {
                    idDetalleCompra: detalleCompraMartina.id,
                    idCorredor: corredorMartina.id,
                    idCarrera: distanciaCarrera.idCarrera,
                    idDistancia: distanciaCarrera.idDistancia,
                    estado: EstadoInscripcion.En_proceso,
                },
            });
        }

        console.log("Inscripción impaga de Martina creada/verificada.");
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