export function formatDate(iso: string): string {
  return iso.split('T')[0]
}

export function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString()
}
