import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, FileStack, MoreHorizontal } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROUTES } from '@/lib/constants'
import { formatDate, formatNumber, formatRelative } from '@/lib/formatters'
import { adminApi } from '@/services/adminApi'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: !!id,
  })

  const { data: creditHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['user-credit-history', id],
    queryFn: () => adminApi.getUserCreditHistory(id!),
    enabled: !!id,
  })

  const { data: diagramsData, isLoading: isLoadingDiagrams } = useQuery({
    queryKey: ['diagrams', { ownerId: id }],
    queryFn: () => adminApi.listDiagrams({ ownerId: id!, pageSize: 50 }),
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['user', id] })
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
  const approveMutation = useMutation({ mutationFn: adminApi.approveUser, onSuccess: invalidate })
  const suspendMutation = useMutation({ mutationFn: adminApi.suspendUser, onSuccess: invalidate })
  const reactivateMutation = useMutation({ mutationFn: adminApi.reactivateUser, onSuccess: invalidate })

  if (isLoading || !id) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!user) {
    return <EmptyState message="User not found." />
  }

  const creditPct = user.creditsLimit > 0 ? Math.min(100, Math.round((user.creditsUsed / user.creditsLimit) * 100)) : 0
  const totalAiMessages = diagramsData?.items.reduce((sum, d) => sum + d.aiMessagesUsed, 0) ?? 0

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => navigate(ROUTES.users)}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to users
      </Button>

      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <Badge variant="outline" className="capitalize">
              {user.plan}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.status === 'pending' && (
                  <DropdownMenuItem onClick={() => approveMutation.mutate(user.id)}>Approve</DropdownMenuItem>
                )}
                {user.status === 'approved' && (
                  <DropdownMenuItem onClick={() => suspendMutation.mutate(user.id)}>Suspend</DropdownMenuItem>
                )}
                {user.status === 'suspended' && (
                  <DropdownMenuItem onClick={() => reactivateMutation.mutate(user.id)}>Reactivate</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Credits Used"
          value={`${formatNumber(user.creditsUsed)} / ${formatNumber(user.creditsLimit)}`}
          icon={CreditCard}
          hint={`${creditPct}% of monthly limit`}
        />
        <StatCard label="Diagrams Created" value={formatNumber(user.diagramCount)} icon={FileStack} />
        <StatCard label="AI Messages Sent" value={formatNumber(totalAiMessages)} icon={CreditCard} hint="Across all diagrams" />
        <StatCard
          label="Member Since"
          value={formatDate(user.createdAt)}
          icon={FileStack}
          hint={`Active ${formatRelative(user.lastActiveAt)}`}
        />
      </div>

      <div className="mt-4">
        <Card className="border-eo-border">
          <CardContent className="pt-6">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credit usage this cycle</span>
              <span className="font-medium">{creditPct}%</span>
            </div>
            <Progress value={creditPct} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-eo-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Credit usage — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory || !creditHistory ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={creditHistory}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => d.slice(5)}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="creditsUsed"
                    name="Credits used"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-eo-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Account details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="capitalize">{user.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={user.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last active</span>
              <span>{formatRelative(user.lastActiveAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-eo-border">
        <CardHeader>
          <CardTitle className="text-base font-medium">Diagrams</CardTitle>
        </CardHeader>
        {isLoadingDiagrams ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !diagramsData || diagramsData.items.length === 0 ? (
          <EmptyState message="This user hasn't created any diagrams yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Controller</TableHead>
                <TableHead>Nodes</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagramsData.items.map((diagram) => (
                <TableRow
                  key={diagram.id}
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.diagramDetail(diagram.id))}
                >
                  <TableCell className="font-medium">
                    <Link
                      to={ROUTES.diagramDetail(diagram.id)}
                      className="hover:text-embedo-logo hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {diagram.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {diagram.mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{diagram.controller}</TableCell>
                  <TableCell>{formatNumber(diagram.nodeCount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(diagram.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
