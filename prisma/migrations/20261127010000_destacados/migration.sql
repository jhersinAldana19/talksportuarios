-- AlterTable
ALTER TABLE "Talk" ADD COLUMN "destacado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Talk" ADD COLUMN "ordenDestacado" INTEGER;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN "destacado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Evento" ADD COLUMN "ordenDestacado" INTEGER;

-- CreateIndex
CREATE INDEX "Talk_destacado_ordenDestacado_idx" ON "Talk"("destacado", "ordenDestacado");

-- CreateIndex
CREATE INDEX "Evento_destacado_ordenDestacado_idx" ON "Evento"("destacado", "ordenDestacado");
