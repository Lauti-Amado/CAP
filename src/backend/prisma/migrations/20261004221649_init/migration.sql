-- CreateTable
CREATE TABLE "Corredor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fechaNacimiento" DATETIME NOT NULL,
    "sexo" TEXT NOT NULL,
    "discapacidad" TEXT,
    "contactoEmergenciaId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    CONSTRAINT "Corredor_contactoEmergenciaId_fkey" FOREIGN KEY ("contactoEmergenciaId") REFERENCES "Persona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Corredor_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AptoMedico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "fechaVencimiento" DATETIME NOT NULL,
    "corredorId" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AptoMedico_corredorId_fkey" FOREIGN KEY ("corredorId") REFERENCES "Corredor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "personaId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Usuario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolAdministrativo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "rolAdministrativoId" TEXT NOT NULL,
    CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsuarioRol_rolAdministrativoId_fkey" FOREIGN KEY ("rolAdministrativoId") REFERENCES "RolAdministrativo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montoTotal" REAL NOT NULL,
    "isPagado" BOOLEAN NOT NULL DEFAULT false,
    "metodoPago" TEXT NOT NULL DEFAULT 'Pago_presencial',
    "usuarioId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Comprobante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montoTotalPago" REAL NOT NULL,
    "fechaHoraPago" DATETIME NOT NULL,
    "documentoTitularPago" TEXT NOT NULL,
    "nombreApellidoTitularPago" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    CONSTRAINT "Comprobante_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreProducto" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductoVariante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreVariante" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "idProducto" TEXT NOT NULL,
    CONSTRAINT "ProductoVariante_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetalleProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cantidad" INTEGER NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    CONSTRAINT "DetalleProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "ProductoVariante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleProducto_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Afiliacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroSocio" INTEGER NOT NULL,
    "afiliadoId" TEXT NOT NULL,
    "fechaHoraAlta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Afiliacion_afiliadoId_fkey" FOREIGN KEY ("afiliadoId") REFERENCES "Corredor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Carrera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "fechaHoraCarrera" DATETIME NOT NULL,
    "fechaHoraEntregaKits" DATETIME NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "participantesMax" INTEGER NOT NULL,
    "lugarId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Creada',
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Carrera_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Distancia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kilometraje" REAL NOT NULL,
    "tipoDistancia" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DistanciaCarrera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "precioDistancia" REAL NOT NULL,
    "idCarrera" TEXT NOT NULL,
    "idDistancia" TEXT NOT NULL,
    CONSTRAINT "DistanciaCarrera_idCarrera_fkey" FOREIGN KEY ("idCarrera") REFERENCES "Carrera" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DistanciaCarrera_idDistancia_fkey" FOREIGN KEY ("idDistancia") REFERENCES "Distancia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Lugar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "localidadId" TEXT NOT NULL,
    CONSTRAINT "Lugar_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "Localidad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'En_proceso',
    "idCompra" TEXT NOT NULL,
    "idCorredor" TEXT NOT NULL,
    "idDistanciaCarrera" TEXT NOT NULL,
    "equipoId" TEXT,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Inscripcion_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_idCorredor_fkey" FOREIGN KEY ("idCorredor") REFERENCES "Corredor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_idDistanciaCarrera_fkey" FOREIGN KEY ("idDistanciaCarrera") REFERENCES "DistanciaCarrera" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificadoCarrera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enviado" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "inscripcionId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificadoCarrera_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "codigoEquipo" TEXT,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntregaKit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inscripcionId" TEXT NOT NULL,
    "dorsalId" TEXT NOT NULL,
    "fechaHoraEntrega" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "EntregaKit_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntregaKit_dorsalId_fkey" FOREIGN KEY ("dorsalId") REFERENCES "Dorsal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dorsal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Chip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "dorsalId" TEXT NOT NULL,
    CONSTRAINT "Chip_dorsalId_fkey" FOREIGN KEY ("dorsalId") REFERENCES "Dorsal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LecturaRFID" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fechaHoraLectura" DATETIME NOT NULL,
    "intensidad" INTEGER NOT NULL,
    "chipId" TEXT NOT NULL,
    "lectorRFIDId" TEXT NOT NULL,
    CONSTRAINT "LecturaRFID_chipId_fkey" FOREIGN KEY ("chipId") REFERENCES "Chip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LecturaRFID_lectorRFIDId_fkey" FOREIGN KEY ("lectorRFIDId") REFERENCES "LectorRFID" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LectorRFID" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" INTEGER NOT NULL,
    "fechaHora" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Clasificacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "inscripcionId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Clasificacion_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resultado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiempoLlegada" INTEGER NOT NULL,
    "puestoGeneral" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "clasificacionId" TEXT NOT NULL,
    "fechaHoraCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHoraModificacion" DATETIME NOT NULL,
    CONSTRAINT "Resultado_clasificacionId_fkey" FOREIGN KEY ("clasificacionId") REFERENCES "Clasificacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultadoCategoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "puesto" INTEGER NOT NULL,
    "resultadoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    CONSTRAINT "ResultadoCategoria_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "Resultado" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResultadoCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CriterioCategoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    CONSTRAINT "CriterioCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Corredor_personaId_key" ON "Corredor"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_dni_key" ON "Persona"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_personaId_key" ON "Usuario"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_usuarioId_rolAdministrativoId_key" ON "UsuarioRol"("usuarioId", "rolAdministrativoId");

-- CreateIndex
CREATE UNIQUE INDEX "Comprobante_compraId_key" ON "Comprobante"("compraId");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombreProducto_key" ON "Producto"("nombreProducto");

-- CreateIndex
CREATE UNIQUE INDEX "Afiliacion_numeroSocio_key" ON "Afiliacion"("numeroSocio");

-- CreateIndex
CREATE UNIQUE INDEX "Afiliacion_afiliadoId_key" ON "Afiliacion"("afiliadoId");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_fechaHoraCarrera_key" ON "Carrera"("fechaHoraCarrera");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_fechaHoraEntregaKits_key" ON "Carrera"("fechaHoraEntregaKits");

-- CreateIndex
CREATE UNIQUE INDEX "Distancia_kilometraje_tipoDistancia_key" ON "Distancia"("kilometraje", "tipoDistancia");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_nombre_key" ON "Localidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Lugar_nombre_key" ON "Lugar"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_idCompra_key" ON "Inscripcion"("idCompra");

-- CreateIndex
CREATE UNIQUE INDEX "CertificadoCarrera_inscripcionId_key" ON "CertificadoCarrera"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "EntregaKit_inscripcionId_key" ON "EntregaKit"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "Chip_dorsalId_key" ON "Chip"("dorsalId");

-- CreateIndex
CREATE UNIQUE INDEX "Clasificacion_inscripcionId_key" ON "Clasificacion"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_clasificacionId_key" ON "Resultado"("clasificacionId");
