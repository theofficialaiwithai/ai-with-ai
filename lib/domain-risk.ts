export const DOMAIN_RISK_CATEGORIES: Record<string, string[]> = {
  payments: ['payment', 'billing', 'checkout', 'invoice', 'subscription', 'stripe', 'refund', 'charge', 'transaction', 'payout'],
  auth: ['auth', 'authentication', 'login', 'session', 'password', 'oauth', 'jwt', 'token', 'sign in', 'sign-in', 'credential', '2fa', 'mfa'],
  health: ['health', 'medical', 'diagnosis', 'patient', 'clinical', 'ehr', 'hipaa', 'drug', 'prescription', 'symptom', 'doctor', 'hospital'],
  pii: ['pii', 'personal data', 'social security', 'date of birth', 'home address', 'passport', 'driver license', 'government id', 'biometric'],
  compliance: ['compliance', 'legal', 'regulation', 'hipaa', 'gdpr', 'soc2', 'sox', 'pci', 'audit', 'regulatory', 'data residency'],
  financial: ['financial', 'bank account', 'tax', 'loan', 'credit score', 'investment', 'trading', 'portfolio', 'hedge', 'derivative', 'securities'],
}

export function checkDomainRisk(text: string): { flagged: boolean; categories: string[] } {
  const lower = text.toLowerCase()
  const matched: string[] = []
  for (const [category, keywords] of Object.entries(DOMAIN_RISK_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      matched.push(category)
    }
  }
  return { flagged: matched.length > 0, categories: matched }
}
