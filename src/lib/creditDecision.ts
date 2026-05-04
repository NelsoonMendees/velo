export function determineCreditStatus(
  score: number,
  entryPercentage: number
): 'APROVADO' | 'EM_ANALISE' | 'REPROVADO' {
  if (entryPercentage >= 0.5 && score < 700) return 'APROVADO';
  if (score > 700) return 'APROVADO';
  if (score >= 501 && score <= 700) return 'EM_ANALISE';
  return 'REPROVADO';
}
