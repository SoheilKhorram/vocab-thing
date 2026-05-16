import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

const Header = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ms-1" />
      <Separator
        orientation="vertical"
        className="me-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>Add New Word</BreadcrumbPage>
          </BreadcrumbItem>
          {/* <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
export default Header