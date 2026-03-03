"use client"

import { useRef } from "react"
import { useLinkEditorStore } from "@/store/linkEditorStore"
import { Link } from "@/types/links"

export function StoreInitializer({ links }: { links: Link[] }) {
  const initialized = useRef(false)
  if (!initialized.current) {
    useLinkEditorStore.setState({ links })
    initialized.current = true
  }
  return null
}
