import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

const PAGE_SIZE = 10

export function DiagramsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['diagrams', { search: debouncedSearch, page }],
    queryFn: () => adminApi.listDiagrams({ search: debouncedSearch, page, pageSize: PAGE_SIZE }),
  })

  return (
    <div>
      <PageHeader title="Diagrams" description="Hardware projects created by users across the product." />

      <Card className="border-eo-border">
        <div className="border-b border-eo-border p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title or owner email…"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState message="No diagrams match your search." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Controller</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((diagram) => (
                  <TableRow
                    key={diagram.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.diagramDetail(diagram.id))}
                  >
                    <TableCell>
                      <div className="font-medium">{diagram.title}</div>
                      <div className="text-xs text-muted-foreground">{diagram.tagline}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{diagram.ownerEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {diagram.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{diagram.controller}</TableCell>
                    <TableCell>{formatNumber(diagram.componentCount)}</TableCell>
                    <TableCell>${diagram.bomEstUnitCostUsd.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(diagram.updatedAt)}</TableCell>
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
