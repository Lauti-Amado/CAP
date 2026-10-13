const ADMIN_EMAIL = 'admin@gmail.com';
const STORAGE_KEY = 'cap.admin.credentials.v1';
const ITERATIONS = 210_000;

type StoredCredentials = { salt: string; hash: string };

function isAdmin(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256,
  );
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}

function readCredentials(): StoredCredentials | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return null;
  const value: unknown = JSON.parse(stored);
  if (
    typeof value !== 'object' || value === null ||
    !('salt' in value) || !('hash' in value) ||
    typeof value.salt !== 'string' || !/^[0-9a-f]{32}$/.test(value.salt) ||
    typeof value.hash !== 'string' || !/^[0-9a-f]{64}$/.test(value.hash)
  ) throw new Error('Las credenciales guardadas no son válidas. Restablecé la contraseña.');
  return { salt: value.salt, hash: value.hash };
}

export async function verifyAdminPassword(email: string, password: string) {
  if (!isAdmin(email)) return false;
  const stored = readCredentials();
  // Credencial inicial para instalaciones que todavía no cambiaron la contraseña.
  if (!stored) return password === '123';
  const salt = Uint8Array.from(stored.salt.match(/.{2}/g)!, byte => parseInt(byte, 16));
  return await hashPassword(password, salt) === stored.hash;
}

// Restablecimiento local de demostración: no verifica la propiedad del correo.
export async function resetAdminPassword(email: string, password: string) {
  if (!isAdmin(email)) throw new Error('Ingresá el correo del administrador: admin@gmail.com.');
  if (password.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  const saltHex = Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: saltHex, hash }));
}
