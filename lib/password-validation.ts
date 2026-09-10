export const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters and contain letters, numbers, and special characters (@$!%*?&.#_-).";

export function getPasswordError(password: string): string | null {
  if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/.test(password)) {
    return PASSWORD_REQUIREMENTS;
  }
  // bcrypt only considers the first 72 bytes of a password.
  if (new TextEncoder().encode(password).length > 72) {
    return "Password must be no more than 72 bytes long.";
  }
  return null;
}
