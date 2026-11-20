import { describe, expect, it } from 'vitest';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'HA';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

describe('Shop Onboarding Helpers', () => {
  it('correctly generates URL slugs from shop names with accents and special characters', () => {
    expect(slugify('Hanoi Archive')).toBe('hanoi-archive');
    expect(slugify('Tiệm Đồ Cũ Sài Gòn')).toBe('tiem-do-cu-sai-gon');
    expect(slugify('Vintage & Co. 1990!')).toBe('vintage-co-1990');
    expect(slugify('   Maison Margiela Archive   ')).toBe(
      'maison-margiela-archive',
    );
  });

  it('correctly computes monogram initials for avatar display', () => {
    expect(computeInitials('')).toBe('HA');
    expect(computeInitials('Hanoi Archive')).toBe('HA');
    expect(computeInitials('ReWear Boutique')).toBe('RB');
    expect(computeInitials('Solo')).toBe('SO');
  });
});
