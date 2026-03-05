import Link from "next/link"
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Palette, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ThemeProvider } from "@/context/theme-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if profile exists, if not redirect to onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, custom_appearance')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    redirect("/onboarding")
  }

  const initialTheme = profile.custom_appearance || undefined

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Mobile Sidebar */}
        <div className="md:hidden border-b p-4 flex items-center justify-between">
          <span className="font-bold text-xl">Linktree Clone</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r bg-gray-50/40">
          <div className="p-6 border-b">
            <span className="font-bold text-xl">Linktree Clone</span>
          </div>
          <SidebarContent />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>
        <Link href="/admin/links">
          <Button variant="ghost" className="w-full justify-start">
            <LinkIcon className="mr-2 h-4 w-4" />
            Links
          </Button>
        </Link>
        <Link href="/admin/appearance">
          <Button variant="ghost" className="w-full justify-start">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </Button>
        </Link>
        <Link href="/admin/analytics">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </nav>
      <div className="p-4 border-t">
        <form action="/auth/signout" method="post">
           <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}
