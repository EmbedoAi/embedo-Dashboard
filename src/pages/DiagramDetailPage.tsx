import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Cpu, MessageSquare, Puzzle, Wallet } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/constants'
import { formatDate, formatNumber } from '@/lib/formatters'
import { adminApi } from '@/services/adminApi'

export function DiagramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: diagram, isLoading } = useQuery({
    queryKey: ['diagram', id],
    queryFn: () => adminApi.getDiagram(id!),
    enabled: !!id,
  })

  if (isLoading || !id) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!diagram) {
    return <EmptyState message="Diagram not found." />
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => navigate(ROUTES.diagrams)}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to diagrams
      </Button>

      <PageHeader
        title={diagram.title}
        description={diagram.tagline}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {diagram.mode}
            </Badge>
            <Badge variant="secondary">{diagram.controller}</Badge>
          </div>
        }
      />

      <p className="-mt-4 mb-6 text-sm text-muted-foreground">
        Owned by{' '}
        <Link to={ROUTES.userDetail(diagram.ownerId)} className="font-medium text-embedo-logo hover:underline">
          {diagram.ownerEmail}
        </Link>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Nodes" value={formatNumber(diagram.nodeCount)} icon={Cpu} />
        <StatCard label="Components" value={formatNumber(diagram.componentCount)} icon={Puzzle} />
        <StatCard
          label="Est. Unit Cost"
          value={`$${diagram.bomEstUnitCostUsd.toFixed(2)}`}
          icon={Wallet}
          hint="At qty 1K"
        />
        <StatCard label="AI Messages Used" value={formatNumber(diagram.aiMessagesUsed)} icon={MessageSquare} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-eo-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Key components</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagram.keyParts.map((part) => (
                <li key={part} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-embedo-logo" />
                  {part}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-eo-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Project details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="capitalize">{diagram.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Controller</span>
              <span>{diagram.controller}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(diagram.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>{formatDate(diagram.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
