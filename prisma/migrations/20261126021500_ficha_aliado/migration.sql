-- CreateEnum
CREATE TYPE "EstadoBeca" AS ENUM ('REALIZADA', 'PROXIMA');

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "beneficios" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado" "Estado" NOT NULL DEFAULT 'BORRADOR',
ADD COLUMN     "frase" TEXT,
ADD COLUMN     "relacionComercial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "CursoAliado" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resumen" TEXT,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursoAliado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BecaAliado" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "cursoId" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "estado" "EstadoBeca" NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BecaAliado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CursoAliado_partnerId_slug_key" ON "CursoAliado"("partnerId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- AddForeignKey
ALTER TABLE "CursoAliado" ADD CONSTRAINT "CursoAliado_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecaAliado" ADD CONSTRAINT "BecaAliado_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecaAliado" ADD CONSTRAINT "BecaAliado_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "CursoAliado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
