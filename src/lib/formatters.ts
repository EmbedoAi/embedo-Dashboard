import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy')
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
