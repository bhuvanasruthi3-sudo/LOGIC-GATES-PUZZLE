/** Build targetRows for n inputs in standard binary order (MSB = first input). */
export function rows(...values: (boolean | 0 | 1)[]): boolean[] {
  return values.map((v) => Boolean(v))
}
