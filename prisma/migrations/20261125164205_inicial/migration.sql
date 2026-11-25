-- CreateEnum
CREATE TYPE "Serie" AS ENUM ('TALKS', 'NEXT_GENERATION', 'EDICION_ESPECIAL');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "NivelPartner" AS ENUM ('PARTNER_FUNDADOR', 'PARTNER', 'ALIADO');

-- CreateTable
CREATE TABLE "Talk" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "serie" "Serie" NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL,
    "resumen" TEXT NOT NULL,
    "puntosClave" TEXT[],
    "transcripcion" TEXT,
    "tags" TEXT[],
    "estado" "Estado" NOT NULL DEFAULT 'BORRADOR',
    "patrocinado" BOOLEAN NOT NULL DEFAULT false,
    "contenidoProvisional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitado" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "empresa" TEXT,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "fotoPublicId" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "modalidad" "Modalidad" NOT NULL,
    "cupoLimitado" BOOLEAN NOT NULL DEFAULT false,
    "linkInscripcion" TEXT,
    "estado" "Estado" NOT NULL DEFAULT 'BORRADOR',
    "aliadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "web" TEXT,
    "nivel" "NivelPartner" NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InvitadoToTalk" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvitadoToTalk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventoToInvitado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToInvitado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Talk_slug_key" ON "Talk"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Talk_youtubeId_key" ON "Talk"("youtubeId");

-- CreateIndex
CREATE INDEX "Talk_estado_fechaPublicacion_idx" ON "Talk"("estado", "fechaPublicacion");

-- CreateIndex
CREATE UNIQUE INDEX "Invitado_slug_key" ON "Invitado"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE INDEX "Evento_estado_fecha_idx" ON "Evento"("estado", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_nombre_key" ON "Partner"("nombre");

-- CreateIndex
CREATE INDEX "_InvitadoToTalk_B_index" ON "_InvitadoToTalk"("B");

-- CreateIndex
CREATE INDEX "_EventoToInvitado_B_index" ON "_EventoToInvitado"("B");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_aliadoId_fkey" FOREIGN KEY ("aliadoId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvitadoToTalk" ADD CONSTRAINT "_InvitadoToTalk_A_fkey" FOREIGN KEY ("A") REFERENCES "Invitado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvitadoToTalk" ADD CONSTRAINT "_InvitadoToTalk_B_fkey" FOREIGN KEY ("B") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToInvitado" ADD CONSTRAINT "_EventoToInvitado_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToInvitado" ADD CONSTRAINT "_EventoToInvitado_B_fkey" FOREIGN KEY ("B") REFERENCES "Invitado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
