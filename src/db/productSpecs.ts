import { DiamondDetails, DiamondGroup, MetalDetails, Product } from '../types.js';

export function emptyDiamondGroup(): DiamondGroup {
  return { count: undefined, clarity: '', color: '', shape: '', weightApprox: '' };
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function normalizeDiamondGroup(raw?: DiamondGroup | null): DiamondGroup | undefined {
  if (!raw) return undefined;
  const group: DiamondGroup = {
    count: toOptionalNumber(raw.count),
    clarity: toOptionalText(raw.clarity),
    color: toOptionalText(raw.color),
    shape: toOptionalText(raw.shape),
    weightApprox: toOptionalText(raw.weightApprox),
  };
  if (!group.count && !group.clarity && !group.color && !group.shape && !group.weightApprox) {
    return undefined;
  }
  return group;
}

export function normalizeDiamondDetails(raw?: DiamondDetails | null): DiamondDetails | undefined {
  if (!raw) return undefined;
  const groups = (raw.groups || [])
    .map((group) => normalizeDiamondGroup(group))
    .filter((group): group is DiamondGroup => Boolean(group));

  const details: DiamondDetails = {
    totalCount: toOptionalNumber(raw.totalCount),
    totalWeight: toOptionalText(raw.totalWeight),
    settingType: toOptionalText(raw.settingType),
    groups,
  };

  if (!details.totalCount && !details.totalWeight && !details.settingType && groups.length === 0) {
    return undefined;
  }
  return details;
}

export function hasDiamondDetails(details?: DiamondDetails | null): boolean {
  return Boolean(normalizeDiamondDetails(details));
}

export function normalizeMetalDetails(
  raw?: MetalDetails | null,
  fallback?: Pick<Product, 'material' | 'purity' | 'weight'>
): MetalDetails | undefined {
  const details: MetalDetails = {
    name: toOptionalText(raw?.name) || toOptionalText(fallback?.material),
    purity: toOptionalText(raw?.purity) || toOptionalText(fallback?.purity),
    weight:
      toOptionalText(raw?.weight) ||
      (fallback?.weight != null && Number.isFinite(Number(fallback.weight))
        ? `${fallback.weight}g`
        : undefined),
  };
  if (!details.name && !details.purity && !details.weight) return undefined;
  return details;
}

export function metalNameFromMaterial(material: string): string {
  if (/yellow/i.test(material)) return 'Yellow Gold';
  if (/white/i.test(material)) return 'White Gold';
  if (/rose/i.test(material)) return 'Rose Gold';
  if (/platinum/i.test(material)) return 'Platinum';
  if (/silver/i.test(material)) return 'Sterling Silver';
  return material;
}

export function metalPurityLabel(purity: string): string {
  const match = purity.match(/\d+\s*K/i);
  return match ? match[0].replace(/\s+/g, '').toUpperCase() : purity;
}
