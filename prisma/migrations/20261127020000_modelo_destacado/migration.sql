-- CreateEnum
CREATE TYPE "TipoDestacado" AS ENUM ('TALK', 'EVENTO', 'ALIADO', 'ENLACE');

-- CreateTable
CREATE TABLE "Destacado" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDestacado" NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tituloCustom" TEXT,
    "ctaCustom" TEXT,
    "imagenUrl" TEXT,
    "imagenPublicId" TEXT,
    "hrefLibre" TEXT,
    "fechaDesde" TIMESTAMP(3),
    "fechaHasta" TIMESTAMP(3),
    "patrocinado" BOOLEAN NOT NULL DEFAULT false,
    "talkId" TEXT,
    "eventoId" TEXT,
    "partnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destacado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destacado_activo_orden_idx" ON "Destacado"("activo", "orden");

-- CreateIndex
CREATE INDEX "Destacado_fechaDesde_fechaHasta_idx" ON "Destacado"("fechaDesde", "fechaHasta");

-- AddForeignKey
ALTER TABLE "Destacado" ADD CONSTRAINT "Destacado_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destacado" ADD CONSTRAINT "Destacado_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destacado" ADD CONSTRAINT "Destacado_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
