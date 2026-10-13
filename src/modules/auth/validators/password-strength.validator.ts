export const passwordStrengthRules = [
  {
    label: 'At least 8 characters',
    isMet: (password: string) => password.length >= 8,
  },
  {
    label: 'At least 12 characters',
    isMet: (password: string) => password.length >= 12,
  },
  {
    label: 'Uppercase and lowercase letters',
    isMet: (password: string) =>
      /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    label: 'At least one number',
    isMet: (password: string) => /\d/.test(password),
  },
  {
    label: 'At least one special character',
    isMet: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export function getPasswordStrengthScore(password: string): number {
  const score = passwordStrengthRules.filter((rule) =>
    rule.isMet(password),
  ).length;

  return score;
}
