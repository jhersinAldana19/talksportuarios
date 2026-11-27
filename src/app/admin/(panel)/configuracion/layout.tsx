import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { MenuConfiguracion } from "@/components/admin/MenuConfiguracion";

export default function LayoutConfiguracion({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <EncabezadoAdmin
        titulo="Configuración"
        descripcion="Tu cuenta, la marca del sitio público y quién tiene acceso al panel."
      />

      {/* Columna izquierda = menú vertical; derecha = contenido. En móvil el menú va arriba, también en columna. */}
      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:gap-7">
        <aside className="w-full shrink-0 md:w-[17.5rem]">
          <MenuConfiguracion />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
