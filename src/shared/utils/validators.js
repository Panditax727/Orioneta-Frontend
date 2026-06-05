export function validateUsername(username) {
  if (!username) return "El nombre de usuario es requerido";
  if (username.length < 3) return "Minimo 3 caracteres";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Solo letras, numeros y _";
  return null;
}

export function validateEmail(email) {
  if (!email) return "El correo es requerido";
  if (!/\S+@\S+\.\S+/.test(email)) return "Correo invalido";
  return null;
}

export function validatePassword(password) {
  if (!password) return "La contrasena es requerida";
  if (password.length < 6) return "Minimo 6 caracteres";
  return null;
}
