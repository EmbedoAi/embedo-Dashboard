import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ROUTES } from '@/lib/constants'
import { formatDate, formatNumber } from '@/lib/formatters'
import { adminApi } from '@/services/adminApi'
import type { UserStatus } from '@/services/types'

const PAGE_SIZE = 10

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<UserStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search: debouncedSearch, status, page }],
    queryFn: () =>
      adminApi.listUsers({ search: debouncedSearch, status, page, pageSize: PAGE_SIZE }),
  })

  const approveMutation = useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
  const suspendMutation = useMutation({
    mutationFn: adminApi.suspendUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
  const reactivateMutation = useMutation({
    mutationFn: adminApi.reactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <div>
      <PageHeader title="Users" description="Review accounts, approve sign-ups, and monitor usage." />

      <Card className="border-eo-border">
        <div className="flex flex-col gap-3 border-b border-eo-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name or email…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as UserStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState message="No users match your filters." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.userDetail(user.id))}
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={ROUTES.userDetail(user.id)}
                        className="hover:text-embedo-logo hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="capitalize">{user.plan}</TableCell>
                    <TableCell>
                      {formatNumber(user.creditsUsed)} / {formatNumber(user.creditsLimit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(ROUTES.userDetail(user.id))}>
                            View details
                          </DropdownMenuItem>
                          {user.status === 'pending' && (
                            <DropdownMenuItem onClick={() => approveMutation.mutate(user.id)}>
                              Approve
                            </DropdownMenuItem>
                          )}
                          {user.status === 'approved' && (
                            <DropdownMenuItem onClick={() => suspendMutation.mutate(user.id)}>
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {user.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => reactivateMutation.mutate(user.id)}>
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
