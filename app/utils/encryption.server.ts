import Cryptr from "cryptr";

export function encrypt(message: string, code: string) {
  const cryptr = new Cryptr(code);
  return cryptr.encrypt(message);
}

export function decrypt(encrypted: string, code: string) {
  const cryptr = new Cryptr(code);
  return cryptr.decrypt(encrypted);
}
