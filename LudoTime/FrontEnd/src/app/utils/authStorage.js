// Guarda y recupera la sesión según el tipo de almacenamiento
const storages = {
  local: typeof window !== "undefined" ? window.localStorage : null,
  session: typeof window !== "undefined" ? window.sessionStorage : null,
};

export function saveUser(user, remember) {
  const storage = remember ? storages.local : storages.session;
  if (!storage) return;
  // Guardamos lo mínimo necesario (sin contraseña)
  storage.setItem("lt_user", JSON.stringify(user));
}

export function loadUser() {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem("lt_user") ??
    window.sessionStorage.getItem("lt_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("lt_user");
  window.sessionStorage.removeItem("lt_user");
}

export function saveRememberedEmail(email) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lt_remember_email", email || "");
}

export function loadRememberedEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("lt_remember_email") || "";
}

export function saveRememberFlag(flag) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lt_remember_flag", flag ? "1" : "0");
}

export function loadRememberFlag() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("lt_remember_flag") === "1";
} 