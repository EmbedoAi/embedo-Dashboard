import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, DollarSign, Key, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'
import { formatDate, formatNumber } from '@/lib/formatters'
import { adminApi } from '@/services/adminApi'
import type { ApiProvider } from '@/services/types'

const PROVIDER_LABELS: Record<ApiProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
}

const PROVIDER_STYLES: Record<ApiProvider, string> = {
  openai: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  anthropic: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
}

export function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['ai-usage-summary'],
    queryFn: adminApi.getAiUsageSummary,
  })

  const { data: keys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: adminApi.listApiKeys,
  })

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleApiKeyStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      queryClient.invalidateQueries({ queryKey: ['ai-usage-summary'] })
    },
  })

  return (
    <div>
      <PageHeader title="Settings" description="AI provider keys, usage, and billing for the copilot." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="AI Spend This Month"
          value={isLoadingSummary || !summary ? '—' : `$${summary.totalSpendUsd.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          label="Total Requests"
          value={isLoadingSummary || !summary ? '—' : formatNumber(summary.totalRequests)}
          icon={Activity}
        />
        <StatCard
          label="Active Keys"
          value={isLoadingSummary || !summary ? '—' : formatNumber(summary.activeKeys)}
          icon={Key}
        />
        <StatCard
          label="Avg. Cost / Request"
          value={isLoadingSummary || !summary ? '—' : `$${summary.avgCostPerRequestUsd.toFixed(4)}`}
          icon={Zap}
        />
      </div>

      <Card className="mt-6 border-eo-border">
        <CardHeader>
          <CardTitle className="text-base font-medium">AI spend — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSummary || !summary ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={summary.dailyUsage}>
                <defs>
                  <linearGradient id="aiSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => d.slice(5)}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spend']}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="costUsd" stroke="hsl(var(--chart-1))" fill="url(#aiSpend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 border-eo-border">
        <CardHeader>
          <CardTitle className="text-base font-medium">API keys</CardTitle>
        </CardHeader>
        {isLoadingKeys ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !keys || keys.length === 0 ? (
          <EmptyState message="No API keys configured yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => {
                const pct = key.monthlyLimitUsd > 0
                  ? Math.min(100, Math.round((key.usedThisMonthUsd / key.monthlyLimitUsd) * 100))
                  : 0
                return (
                  <TableRow key={key.id}>
                    <TableCell>
                      <Badge variant="secondary" className={PROVIDER_STYLES[key.provider]}>
                        {PROVIDER_LABELS[key.provider]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{key.label}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{key.maskedKey}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          key.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100',
                        )}
                      >
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>${key.usedThisMonthUsd.toFixed(2)}</span>
                        <span>${key.monthlyLimitUsd.toFixed(0)}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </TableCell>
                    <TableCell>{formatNumber(key.requestsThisMonth)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleMutation.mutate(key.id)}
                      >
                        {key.status === 'active' ? 'Revoke' : 'Reactivate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
