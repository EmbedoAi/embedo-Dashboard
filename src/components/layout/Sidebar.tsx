import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
      <SidebarNav />
    </aside>
  )
}
