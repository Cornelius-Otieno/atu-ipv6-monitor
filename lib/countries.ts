// Country code to flag emoji mapping
export function getFlagEmoji(cc: string): string {
  if (!cc || cc?.length !== 2) return '🏳️';
  const codePoints = [...cc.toUpperCase()].map(
    (c: string) => 0x1f1e6 + (c?.charCodeAt?.(0) ?? 65) - 65
  );
  return String.fromCodePoint(...codePoints);
}

export const SUB_REGIONS = [
  'North Africa',
  'West Africa',
  'East Africa',
  'Central Africa',
  'Southern Africa',
] as const;

export type SubRegion = (typeof SUB_REGIONS)[number];

// Status based on IPv6 preferred percentage
export function getStatusInfo(preferredPc: number | null | undefined): {
  label: string;
  emoji: string;
  color: string;
} {
  const val = preferredPc ?? 0;
  if (val >= 10) return { label: 'On Track', emoji: '🟢', color: 'text-green-600' };
  if (val >= 5) return { label: 'In Progress', emoji: '🟡', color: 'text-yellow-600' };
  return { label: 'Needs Attention', emoji: '🔴', color: 'text-red-600' };
}
