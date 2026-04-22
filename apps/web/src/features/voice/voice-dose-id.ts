/** UUID:numeric slot — как на backend для today-doses. */
export function isApiDoseId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:\d+$/i.test(id)
}

export function parseDoseSlotId(
  doseId: string,
): { medicationId: string; slotIndex: number } | null {
  const c = doseId.lastIndexOf(':')
  if (c < 0) return null
  const medicationId = doseId.slice(0, c)
  const slotIndex = Number(doseId.slice(c + 1))
  if (!Number.isFinite(slotIndex)) return null
  if (!isApiDoseId(doseId)) return null
  return { medicationId, slotIndex }
}
