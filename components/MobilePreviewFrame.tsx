import { Share2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MobilePreviewFrameProps {
  children: React.ReactNode
  username: string
  className?: string
}

export function MobilePreviewFrame({ children, username, className = "" }: MobilePreviewFrameProps) {
  return (
    <div className={`relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl ${className}`}>
      <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-950 relative">
        {/* Browser Bar Simulation */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 pt-4">
          <div className="text-[10px] text-gray-500 font-medium truncate max-w-[180px]">
            linktree.clone/{username}
          </div>
          <button className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <ScrollArea className="h-full w-full pt-12">
          {children}
        </ScrollArea>
      </div>
    </div>
  )
}
