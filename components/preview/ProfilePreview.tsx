"use client"

import { useTheme } from "@/context/theme-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfilePreview() {
  const { theme } = useTheme()

  const getBackgroundStyle = () => {
    switch (theme.backgroundType) {
      case 'color': return { backgroundColor: theme.backgroundColor }
      case 'gradient': return { background: theme.backgroundGradient }
      case 'image': return { backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      default: return { backgroundColor: '#ffffff' }
    }
  }

  const getFontClass = () => {
    switch (theme.fontFamily) {
      case 'modern': return 'font-sans'
      case 'rounded': return 'font-sans font-bold tracking-tight'
      case 'minimal': return 'font-mono'
      case 'serif': return 'font-serif'
      default: return 'font-sans'
    }
  }

  const getLayoutClass = () => {
    switch (theme.layoutStyle) {
      case 'wide': return 'px-2 py-8'
      case 'compact': return 'px-6 py-4 gap-2'
      case 'center':
      default: return 'px-6 py-8 gap-4'
    }
  }

  const getButtonStyle = () => {
    const base = { borderRadius: `${theme.buttonRadius}px` }
    switch (theme.buttonStyle) {
      case 'outline': return { ...base, border: `2px solid ${theme.buttonColor}`, backgroundColor: 'transparent', color: theme.buttonColor }
      case 'soft': return { ...base, backgroundColor: theme.buttonColor, opacity: 0.8, color: '#fff' }
      case 'hard': return { ...base, backgroundColor: theme.buttonColor, boxShadow: `4px 4px 0px 0px #000`, color: '#fff' }
      case 'fill':
      default: return { ...base, backgroundColor: theme.buttonColor, color: '#fff' }
    }
  }

  const getAnimationClass = () => {
    switch (theme.animationStyle) {
      case 'slide': return 'hover:translate-x-2 transition-transform'
      case 'bounce': return 'hover:-translate-y-1 transition-transform'
      case 'fade': return 'hover:opacity-80 transition-opacity'
      case 'none':
      default: return ''
    }
  }

  const isDarkBg = theme.backgroundType === 'color' && theme.backgroundColor === '#0f0f0f'
  const textColor = isDarkBg ? 'text-white' : 'text-gray-900'

  return (
    <div className="w-full max-w-[320px] h-[650px] rounded-[3rem] border-[8px] border-black shadow-2xl overflow-hidden relative bg-white">
      <div 
        className={cn("absolute inset-0 w-full h-full flex flex-col items-center", getFontClass(), getLayoutClass())}
        style={getBackgroundStyle()}
      >
        <Avatar className="w-24 h-24 mb-4 border-2 border-white shadow-md">
          <AvatarImage src="https://picsum.photos/seed/avatar/200/200" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>

        <h2 className={cn("text-xl font-bold mb-1", textColor)}>Jane Doe</h2>
        <p className={cn("text-sm mb-6 text-center opacity-80", textColor)}>
          Digital Creator & Designer. Welcome to my links!
        </p>

        <div className="w-full flex flex-col gap-3">
          {["My Portfolio", "Latest Video", "Twitter", "Instagram"].map((link, i) => (
            <a
              key={i}
              href="#"
              className={cn(
                "w-full py-4 px-6 text-center font-medium flex items-center justify-center",
                getAnimationClass()
              )}
              style={getButtonStyle()}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
