"use client";

import { useActionState, useMemo, useState } from "react";
import { guardarDestacado, type EstadoFormularioDestacado } from "@/app/admin/acciones/destacados";
import { ayuda, campo, etiqueta } from "@/components/admin/clases";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import { TipoDestacado } from "@/generated/prisma/enums";
import { ETIQUETA_TIPO_DESTACADO, miniaturaYoutube } from "@/lib/formato";
import { MARCA_OFICIAL } from "@/lib/marca";

export type ValoresDestacado = {
  id: string;
  tipo: string;
  talkId: string;
  eventoId: string;
  partnerId: string;
  hrefLibre: string;
  tituloCustom: string;
  ctaCustom: string;
  imagenUrl: string;
  fechaDesde: string;
  fechaHasta: string;
  patrocinado: boolean;
  activo: boolean;
};

export type OpcionesDestacado = {
  talks: { id: string; titulo: string; youtubeId: string }[];
  eventos: { id: string; titulo: string; fechaISO: string }[];
  aliados: { id: string; nombre: string; slug: string | null; logoUrl: string | null }[];
};

function errorCampo(estado: EstadoFormularioDestacado, clave: keyof NonNullable<EstadoFormularioDestacado["errores"]>) {
  return estado.errores?.[clave];
}

function imagenCarruselPermitida(src: string): string | null {
  const limpio = src.trim();
  if (!limpio) return null;
  if (limpio.startsWith("/") && !limpio.startsWith("//")) return limpio;
  try {
    const parseada = new URL(limpio);
    if (parseada.protocol === "https:" || parseada.protocol === "http:") return parseada.toString();
  } catch {
    return null;
  }
  return null;
}

export function FormularioDestacado({
  destacado,
  opciones,
}: {
  destacado: ValoresDestacado | null;
  opciones: OpcionesDestacado;
}) {
  const [estado, accion, pendiente] = useActionState(guardarDestacado, {} as EstadoFormularioDestacado);
  const [tipo, setTipo] = useState(destacado?.tipo ?? "TALK");
  const [busqueda, setBusqueda] = useState("");
  const [talkId, setTalkId] = useState(destacado?.talkId ?? "");
  const [eventoId, setEventoId] = useState(destacado?.eventoId ?? "");
  const [partnerId, setPartnerId] = useState(destacado?.partnerId ?? "");
  const [hrefLibre, setHrefLibre] = useState(destacado?.hrefLibre ?? "");
  const [tituloCustom, setTituloCustom] = useState(destacado?.tituloCustom ?? "");
  const [ctaCustom, setCtaCustom] = useState(destacado?.ctaCustom ?? "");
  const [imagenUrl, setImagenUrl] = useState(destacado?.imagenUrl ?? "");
  const [patrocinado, setPatrocinado] = useState(destacado?.patrocinado ?? false);

  const q = busqueda.trim().toLowerCase();

  const talksFiltrados = useMemo(
    () => (q ? opciones.talks.filter((t) => t.titulo.toLowerCase().includes(q)) : opciones.talks),
    [opciones.talks, q],
  );
  const eventosFiltrados = useMemo(
    () => (q ? opciones.eventos.filter((e) => e.titulo.toLowerCase().includes(q)) : opciones.eventos),
    [opciones.eventos, q],
  );
  const aliadosFiltrados = useMemo(
    () => (q ? opciones.aliados.filter((a) => a.nombre.toLowerCase().includes(q)) : opciones.aliados),
    [opciones.aliados, q],
  );

  const preview = useMemo(() => {
    let titulo = tituloCustom.trim();
    let cta = ctaCustom.trim();
    const imagenPedida = imagenUrl.trim();
    const imagenCustomOk = imagenPedida ? imagenCarruselPermitida(imagenPedida) : null;
    const avisoImagen =
      imagenPedida && !imagenCustomOk ? "Esa URL de imagen no es válida; se usará la imagen automática." : null;

    let imagen = imagenCustomOk ?? "";

    if (tipo === "TALK") {
      const talk = opciones.talks.find((t) => t.id === talkId);
      if (!titulo) titulo = talk?.titulo ?? "Talk";
      if (!imagen && talk) imagen = miniaturaYoutube(talk.youtubeId);
      if (!cta) cta = "Ver Talk";
    } else if (tipo === "EVENTO") {
      const evento = opciones.eventos.find((e) => e.id === eventoId);
      if (!titulo) titulo = evento?.titulo ?? "Evento";
      if (!imagen) imagen = MARCA_OFICIAL.heroUrl;
      if (!cta) cta = "Inscribirme";
    } else if (tipo === "ALIADO") {
      const aliado = opciones.aliados.find((a) => a.id === partnerId);
      if (!titulo) titulo = aliado?.nombre ?? "Aliado";
      if (!imagen) imagen = aliado?.logoUrl || "/partners/sarmiento.webp";
      if (!cta) cta = "Ver aliado";
    } else {
      if (!titulo) titulo = "Destacado";
      if (!cta) cta = "Ver más";
    }

    if (!imagen) imagen = MARCA_OFICIAL.heroUrl;
    return { titulo, imagen, cta, avisoImagen };
  }, [tipo, talkId, eventoId, partnerId, tituloCustom, ctaCustom, imagenUrl, opciones]);

  const selectorContenido = (
    <>
      <fieldset className="flex flex-col gap-3">
        <legend className={etiqueta}>¿Qué quieres destacar?</legend>
        <div className="flex flex-wrap gap-3">
          {Object.values(TipoDestacado).map((valor) => (
            <label key={valor} className="inline-flex items-center gap-2 text-sm text-texto">
              <input
                type="radio"
                name="tipo"
                value={valor}
                checked={tipo === valor}
                onChange={() => {
                  setTipo(valor);
                  setBusqueda("");
                }}
              />
              {ETIQUETA_TIPO_DESTACADO[valor]}
            </label>
          ))}
        </div>
        {errorCampo(estado, "tipo") && (
          <p className="text-sm text-magenta" role="alert">
            {errorCampo(estado, "tipo")}
          </p>
        )}
      </fieldset>

      {tipo !== "ENLACE" && (
        <label className={etiqueta}>
          Filtrar la lista de abajo
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe parte del nombre para acotar opciones"
            className={campo}
          />
          <span className={ayuda}>No es el título del destacado. El titular va en el siguiente paso.</span>
        </label>
      )}

      {tipo === "TALK" && (
        <label className={etiqueta}>
          Talk publicado
          <select
            name="talkId"
            required={talksFiltrados.length > 0}
            value={talkId}
            onChange={(e) => setTalkId(e.target.value)}
            className={campo}
          >
            <option value="">Elige un Talk</option>
            {talksFiltrados.map((talk) => (
              <option key={talk.id} value={talk.id}>
                {talk.titulo}
              </option>
            ))}
          </select>
          {q && talksFiltrados.length === 0 && (
            <span className="mt-2 block text-sm text-magenta" role="status">
              Ningún Talk coincide con «{busqueda.trim()}». Borra el filtro.
            </span>
          )}
          {errorCampo(estado, "talkId") && (
            <span className="mt-2 block text-sm text-magenta" role="alert">
              {errorCampo(estado, "talkId")}
            </span>
          )}
        </label>
      )}

      {tipo === "EVENTO" && (
        <label className={etiqueta}>
          Evento futuro
          <select
            name="eventoId"
            required={eventosFiltrados.length > 0}
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
            className={campo}
          >
            <option value="">Elige un evento</option>
            {eventosFiltrados.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.titulo} ({evento.fechaISO})
              </option>
            ))}
          </select>
          {q && eventosFiltrados.length === 0 && (
            <span className="mt-2 block text-sm text-magenta" role="status">
              Ningún evento coincide con «{busqueda.trim()}». Borra el filtro.
            </span>
          )}
          {errorCampo(estado, "eventoId") && (
            <span className="mt-2 block text-sm text-magenta" role="alert">
              {errorCampo(estado, "eventoId")}
            </span>
          )}
        </label>
      )}

      {tipo === "ALIADO" && (
        <div className="flex flex-col gap-2">
          <label className={etiqueta}>
            Aliado con ficha publicada
            <select
              name="partnerId"
              required={aliadosFiltrados.length > 0}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className={campo}
              disabled={opciones.aliados.length === 0}
            >
              <option value="">
                {opciones.aliados.length === 0 ? "No hay aliados disponibles" : "Elige un aliado"}
              </option>
              {aliadosFiltrados.map((aliado) => (
                <option key={aliado.id} value={aliado.id}>
                  {aliado.nombre}
                </option>
              ))}
            </select>
          </label>
          {opciones.aliados.length === 0 ? (
            <p className="text-sm text-texto" role="status">
              Solo aparecen partners con nivel Aliado, activos, publicados y con slug.
            </p>
          ) : q && aliadosFiltrados.length === 0 ? (
            <p className="text-sm text-magenta" role="status">
              Ningún aliado coincide con «{busqueda.trim()}». Borra el filtro.
            </p>
          ) : (
            <p className={ayuda}>El slide enlazará a la ficha pública del aliado.</p>
          )}
          {errorCampo(estado, "partnerId") && (
            <p className="text-sm text-magenta" role="alert">
              {errorCampo(estado, "partnerId")}
            </p>
          )}
        </div>
      )}

      {tipo === "ENLACE" && (
        <label className={etiqueta}>
          URL del enlace
          <input
            name="hrefLibre"
            required
            value={hrefLibre}
            onChange={(e) => setHrefLibre(e.target.value)}
            placeholder="https://… o /formacion"
            className={campo}
          />
          <span className={ayuda}>Puede ser una URL completa o una ruta del sitio (/formacion).</span>
          {errorCampo(estado, "hrefLibre") && (
            <span className="mt-2 block text-sm text-magenta" role="alert">
              {errorCampo(estado, "hrefLibre")}
            </span>
          )}
        </label>
      )}
    </>
  );

  return (
    <form action={accion} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
      {destacado && <input type="hidden" name="id" value={destacado.id} />}
      <div>
        <FormularioPasos
          error={estado.error}
          pendiente={pendiente}
          textoEnviar={destacado ? "Guardar cambios" : "Crear destacado"}
          pasos={[
            { id: "destino", titulo: "Destino", contenido: selectorContenido },
            {
              id: "textos",
              titulo: "Textos e imagen",
              contenido: (
                <>
                  <label className={etiqueta}>
                    Titular personalizado
                    <input
                      name="tituloCustom"
                      value={tituloCustom}
                      onChange={(e) => setTituloCustom(e.target.value)}
                      className={campo}
                    />
                    <span className={ayuda}>Si lo dejas vacío, se usa el título del Talk, evento o aliado.</span>
                    {errorCampo(estado, "tituloCustom") && (
                      <span className="mt-2 block text-sm text-magenta" role="alert">
                        {errorCampo(estado, "tituloCustom")}
                      </span>
                    )}
                  </label>
                  <label className={etiqueta}>
                    Texto del botón
                    <input
                      name="ctaCustom"
                      value={ctaCustom}
                      onChange={(e) => setCtaCustom(e.target.value)}
                      placeholder="Ver Talk"
                      className={campo}
                    />
                    {errorCampo(estado, "ctaCustom") && (
                      <span className="mt-2 block text-sm text-magenta" role="alert">
                        {errorCampo(estado, "ctaCustom")}
                      </span>
                    )}
                  </label>
                  <label className={etiqueta}>
                    Imagen (URL o ruta en /public)
                    <input
                      name="imagenUrl"
                      value={imagenUrl}
                      onChange={(e) => setImagenUrl(e.target.value)}
                      placeholder="/partners/sarmiento.webp"
                      className={campo}
                    />
                    <span className={ayuda}>
                      Ruta del sitio (<code className="font-normal normal-case tracking-normal">/partners/tecport.webp</code>
                      ) o URL https.
                    </span>
                    {preview.avisoImagen && (
                      <span className="mt-2 block text-sm text-magenta" role="status">
                        {preview.avisoImagen}
                      </span>
                    )}
                    {errorCampo(estado, "imagenUrl") && (
                      <span className="mt-2 block text-sm text-magenta" role="alert">
                        {errorCampo(estado, "imagenUrl")}
                      </span>
                    )}
                  </label>
                </>
              ),
            },
            {
              id: "vigencia",
              titulo: "Vigencia",
              contenido: (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className={etiqueta}>
                      Vigente desde
                      <input
                        name="fechaDesde"
                        type="date"
                        defaultValue={destacado?.fechaDesde ?? ""}
                        className={campo}
                      />
                      {errorCampo(estado, "fechaDesde") && (
                        <span className="mt-2 block text-sm text-magenta" role="alert">
                          {errorCampo(estado, "fechaDesde")}
                        </span>
                      )}
                    </label>
                    <label className={etiqueta}>
                      Vigente hasta
                      <input
                        name="fechaHasta"
                        type="date"
                        defaultValue={destacado?.fechaHasta ?? ""}
                        className={campo}
                      />
                      {errorCampo(estado, "fechaHasta") && (
                        <span className="mt-2 block text-sm text-magenta" role="alert">
                          {errorCampo(estado, "fechaHasta")}
                        </span>
                      )}
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-texto">
                    <input
                      type="checkbox"
                      name="patrocinado"
                      checked={patrocinado}
                      onChange={(e) => setPatrocinado(e.target.checked)}
                    />
                    Patrocinado (etiqueta visible en el carrusel)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-texto">
                    <input type="checkbox" name="activo" defaultChecked={destacado?.activo ?? true} />
                    Activo
                  </label>
                </>
              ),
            },
          ]}
        >
          {tipo !== "TALK" && <input type="hidden" name="talkId" value="" />}
          {tipo !== "EVENTO" && <input type="hidden" name="eventoId" value="" />}
          {tipo !== "ALIADO" && <input type="hidden" name="partnerId" value="" />}
          {tipo !== "ENLACE" && <input type="hidden" name="hrefLibre" value="" />}
        </FormularioPasos>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold tracking-[0.14em] text-titulo uppercase">Vista previa</p>
        <div className="mt-3 overflow-hidden border border-borde bg-marino">
          <div className="relative aspect-video bg-marino">
            {preview.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.imagen} alt="" className="h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-[rgb(17_25_102/0.82)] p-4 text-claro">
              {patrocinado && <span className="text-sm text-magenta">Patrocinado</span>}
              <p className="text-base font-medium leading-snug">{preview.titulo}</p>
              <span className="boton">{preview.cta}</span>
            </div>
          </div>
        </div>
        {preview.avisoImagen && (
          <p className="mt-3 text-sm text-magenta" role="status">
            {preview.avisoImagen}
          </p>
        )}
      </aside>
    </form>
  );
}
