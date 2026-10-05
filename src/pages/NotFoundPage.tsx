import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-eo-surface-alt text-center">
      <p className="text-6xl font-bold text-embedo-logo">404</p>
      <p className="text-muted-foreground">This page doesn't exist.</p>
      <Button asChild>
        <Link to={ROUTES.overview}>Back to dashboard</Link>
      </Button>
    </div>
  )
}
