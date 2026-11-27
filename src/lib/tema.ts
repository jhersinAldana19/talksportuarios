// Tema claro/oscuro. Va en un módulo normal (no "use client") porque el layout del
// servidor necesita el texto del script: lo que exporta un archivo "use client" llega
// al servidor como referencia de cliente, no como valor.

export const CLAVE_TEMA = "tema";

/**
 * Se ejecuta en el <head> antes del primer pintado.
 * Claro por defecto (no mira prefers-color-scheme). Solo oscuro si el usuario
 * lo eligió con el botón y quedó guardado en localStorage.
 */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");document.documentElement.classList.toggle("dark",t==="oscuro")}catch(e){}})()`;
