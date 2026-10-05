import { useQuery } from '@tanstack/react-query'
import { CreditCard, FileStack, UserCheck, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { adminApi } from '@/services/adminApi'
import { formatNumber } from '@/lib/formatters'

const PLAN_COLORS: Record<string, string> = {
  free: 'hsl(var(--chart-3))',
  pro: 'hsl(var(--chart-1))',
  team: 'hsl(var(--chart-2))',
}

export function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: adminApi.getAnalyticsSummary,
  })

  return (
    <div>
      <PageHeader title="Overview" description="Key metrics across users, diagrams, and usage." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={isLoading || !data ? '—' : formatNumber(data.totalUsers)}
          icon={Users}
        />
        <StatCard
          label="Pending Approvals"
          value={isLoading || !data ? '—' : formatNumber(data.pendingUsers)}
          icon={UserCheck}
          hint="Awaiting review"
        />
        <StatCard
          label="Total Diagrams"
          value={isLoading || !data ? '—' : formatNumber(data.totalDiagrams)}
          icon={FileStack}
        />
        <StatCard
          label="Credits Used"
          value={isLoading || !data ? '—' : formatNumber(data.totalCreditsUsed)}
          icon={CreditCard}
          hint="Across all users"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-eo-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">New users — last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.newUsersLast7d}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                  <Bar dataKey="count" name="New users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-eo-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Plan breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.planBreakdown}
                    dataKey="count"
                    nameKey="plan"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.planBreakdown.map((entry) => (
                      <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {data?.planBreakdown.map((entry) => (
                <div key={entry.plan} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: PLAN_COLORS[entry.plan] }}
                  />
                  <span className="capitalize">{entry.plan}</span>
                  <span>({entry.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
