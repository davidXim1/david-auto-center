export function isBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^55?\d{10,11}$/.test(digits) || /^\d{10,11}$/.test(digits);
}

export function isBrazilianPlate(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z]{3}\d{4}$/.test(normalized) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(normalized);
}

export function isCep(value: string) {
  return /^\d{5}-?\d{3}$/.test(value);
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}
