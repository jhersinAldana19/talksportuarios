import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RONDAS_HASH = 12;

export type AdminLogin = {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
};

/** Busca un administrador por correo (el correo se compara en minúsculas). */
export async function buscarAdminPorEmail(email: string): Promise<AdminLogin | null> {
  return prisma.admin.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, nombre: true, passwordHash: true },
  });
}

/**
 * Crea el administrador solo si ese correo no existe.
 * No pisa la contraseña de una fila que ya está: re-ejecutar el seed no la reinicia.
 */
export async function crearAdminSiNoExiste(datos: {
  email: string;
  nombre: string;
  password: string;
}): Promise<{ ok: true; creado: boolean } | { ok: false; error: string }> {
  const email = datos.email.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  if (!email || !nombre || !datos.password) {
    return { ok: false, error: "Faltan correo, nombre o contraseña." };
  }
  if (datos.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const existente = await prisma.admin.findUnique({ where: { email }, select: { id: true } });
  if (existente) return { ok: true, creado: false };

  const passwordHash = await hash(datos.password, RONDAS_HASH);
  await prisma.admin.create({ data: { email, nombre, passwordHash } });
  return { ok: true, creado: true };
}

export type AdminResumen = {
  id: string;
  email: string;
  nombre: string;
};

/** Cuentas del panel, de la más antigua a la más nueva. Sin la contraseña. */
export async function listarAdmins(): Promise<AdminResumen[]> {
  return prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, nombre: true },
  });
}

/** Perfil visible (sin hash). */
export async function obtenerAdminPorId(id: string): Promise<AdminResumen | null> {
  return prisma.admin.findUnique({
    where: { id },
    select: { id: true, email: true, nombre: true },
  });
}

export type EntradaCuentaPropia = {
  nombre: string;
  email: string;
  /** Obligatoria solo si se cambia la contraseña. */
  contraseñaActual: string;
  contraseñaNueva: string;
  confirmacion: string;
};

/**
 * Actualiza el admin logueado. Si envía contraseña nueva, exige la actual
 * y que coincida la confirmación.
 */
export async function actualizarCuentaPropia(
  adminId: string,
  datos: EntradaCuentaPropia,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const nombre = datos.nombre.trim();
  const email = datos.email.trim().toLowerCase();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (nombre.length > 120) return { ok: false, error: "El nombre es demasiado largo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "El correo no es válido." };
  }

  const actual = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!actual) return { ok: false, error: "No se encontró tu cuenta." };

  if (email !== actual.email) {
    const ocupado = await prisma.admin.findUnique({ where: { email }, select: { id: true } });
    if (ocupado) return { ok: false, error: "Ya hay una cuenta con ese correo." };
  }

  const quiereCambiarClave = Boolean(datos.contraseñaNueva || datos.confirmacion || datos.contraseñaActual);
  let passwordHash: string | undefined;

  if (quiereCambiarClave) {
    if (!datos.contraseñaActual) {
      return { ok: false, error: "Para cambiar la contraseña indica la actual." };
    }
    const coincide = await compare(datos.contraseñaActual, actual.passwordHash);
    if (!coincide) return { ok: false, error: "La contraseña actual no es correcta." };
    if (datos.contraseñaNueva.length < 8) {
      return { ok: false, error: "La contraseña nueva debe tener al menos 8 caracteres." };
    }
    if (datos.contraseñaNueva.length > 200) {
      return { ok: false, error: "La contraseña nueva es demasiado larga." };
    }
    if (datos.contraseñaNueva !== datos.confirmacion) {
      return { ok: false, error: "La contraseña nueva y su confirmación no coinciden." };
    }
    passwordHash = await hash(datos.contraseñaNueva, RONDAS_HASH);
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: {
      nombre,
      email,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });
  return { ok: true };
}

/** Crea otra cuenta. Si el correo ya existe, no pisa la contraseña. */
export async function crearAdmin(datos: {
  email: string;
  nombre: string;
  password: string;
  confirmacion: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = datos.email.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (nombre.length > 120) return { ok: false, error: "El nombre es demasiado largo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "El correo no es válido." };
  }
  if (datos.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (datos.password.length > 200) return { ok: false, error: "La contraseña es demasiado larga." };
  if (datos.password !== datos.confirmacion) {
    return { ok: false, error: "Las contraseñas no coinciden." };
  }

  const existente = await prisma.admin.findUnique({ where: { email }, select: { id: true } });
  if (existente) return { ok: false, error: "Ya hay una cuenta con ese correo." };

  const passwordHash = await hash(datos.password, RONDAS_HASH);
  await prisma.admin.create({ data: { email, nombre, passwordHash } });
  return { ok: true };
}
