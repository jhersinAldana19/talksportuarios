-- CreateTable
CREATE TABLE "ConfiguracionSitio" (
    "id" TEXT NOT NULL DEFAULT 'sitio',
    "colorPrimario" TEXT NOT NULL,
    "colorSecundario" TEXT NOT NULL,
    "colorTerciario" TEXT NOT NULL,
    "logoUrl" TEXT,
    "heroUrl" TEXT NOT NULL,
    "respaldoJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionSitio_pkey" PRIMARY KEY ("id")
);
