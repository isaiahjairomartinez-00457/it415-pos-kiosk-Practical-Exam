/** All money in this app is stored and calculated as integer centavos (₱45.00 = 4500). */

export const CENTAVOS_PER_PESO = 100;

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * CENTAVOS_PER_PESO);
}

/** formatMoney(4500) → "₱45.00" */
export function formatMoney(centavos: number): string {
  const negative = centavos < 0;
  const abs = Math.abs(Math.trunc(centavos));
  const pesos = Math.floor(abs / CENTAVOS_PER_PESO);
  const cents = String(abs % CENTAVOS_PER_PESO).padStart(2, "0");
  const grouped = pesos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}₱${grouped}.${cents}`;
}
