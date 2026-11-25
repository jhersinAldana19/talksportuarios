// Tema claro/oscuro. Va en un módulo normal (no "use client") porque el layout del
// servidor necesita el texto del script: lo que exporta un archivo "use client" llega
// al servidor como referencia de cliente, no como valor.

export const CLAVE_TEMA = "tema";

/** Se ejecuta en el <head> antes del primer pintado: aplica la clase "dark" sin parpadeo. */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");var o=t?t==="oscuro":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",o)}catch(e){}})()`;
