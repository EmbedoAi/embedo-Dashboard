import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserStatus } from '@/services/types'

const STYLES: Record<UserStatus, string> = {
  approved: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  suspended: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const LABELS: Record<UserStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  suspended: 'Suspended',
}

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant="secondary" className={cn('font-medium', STYLES[status])}>
      {LABELS[status]}
    </Badge>
  )
}
