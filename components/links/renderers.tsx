"use client"

import { Link } from "@/types/links"
import { motion } from "motion/react"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

// --- Renderers ---

const ClassicLink = ({ link }: { link: Link }) => {
  const trackClick = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        profile_id: link.profile_id,
        link_id: link.id, 
        event_type: "link_click" 
      })
    }).catch(console.error)
  }

  return (
    <a
      href={link.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
      onClick={trackClick}
    >
      <div 
        className="flex items-center p-4 transition-transform shadow-sm hover:shadow-md"
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          color: 'var(--card-text, #000000)',
          borderRadius: 'var(--card-radius, 8px)',
          border: '1px solid rgba(0,0,0,0.1)' // Optional: make this variable too
        }}
      >
        {link.thumbnail_url && (
          <div className="relative w-10 h-10 mr-4 rounded-full overflow-hidden flex-shrink-0">
            <Image 
              src={link.thumbnail_url} 
              alt="" 
              fill
              className="object-cover"
            />
          </div>
        )}
        <span className="flex-1 text-center font-medium">{link.title}</span>
        <div className="w-10 flex justify-end">
           {/* Spacer or icon */}
        </div>
      </div>
    </a>
  )
}

const HeaderBlock = ({ link }: { link: Link }) => (
  <h2 className="text-xl font-bold text-center my-4 text-gray-900">{link.title}</h2>
)

const TextBlock = ({ link }: { link: Link }) => (
  <p className="text-center text-gray-600 my-2 px-4">{link.title}</p>
)

// Placeholder for other types
const GenericLink = ({ link }: { link: Link }) => (
  <ClassicLink link={link} />
)

// --- Registry ---

const linkRenderers: Record<string, React.ComponentType<{ link: Link }>> = {
  classic: ClassicLink,
  header: HeaderBlock,
  text_block: TextBlock,
  image: GenericLink, // TODO: Implement specific renderers
  video: GenericLink,
  music: GenericLink,
  commerce: GenericLink,
  email_collector: GenericLink,
  contact: GenericLink,
  map: GenericLink,
}

// --- Main Component ---

export function LinkRenderer({ link, style }: { link: Link; style?: React.CSSProperties }) {
  const Renderer = linkRenderers[link.type] || ClassicLink

  const getAnimation = () => {
    if (!link.is_highlighted) return {}
    switch (link.highlight_animation) {
      case 'shake': return { x: [0, -5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 2, repeatDelay: 3 } }
      case 'pulse': return { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.5, repeatDelay: 1 } }
      case 'bounce': return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 1, repeatDelay: 2 } }
      case 'glow': return { boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 15px rgba(59,130,246,0.3)", "0 0 0px rgba(0,0,0,0)"], transition: { repeat: Infinity, duration: 2 } }
      default: return {}
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={link.is_highlighted ? {} : { scale: 1.02 }}
      className="w-full max-w-md mb-4"
      style={style}
    >
      <motion.div animate={getAnimation()}>
        <Renderer link={link} />
      </motion.div>
    </motion.div>
  )
}
