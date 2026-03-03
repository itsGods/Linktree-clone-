"use client"

import { useEffect } from "react"
import { useAppearanceStore } from "@/store/appearance-store"
import { ThemeGallery } from "@/components/appearance/theme-gallery"
import { BackgroundEditor } from "@/components/appearance/background-editor"
import { CardEditor } from "@/components/appearance/card-editor"
import { FontEditor } from "@/components/appearance/font-editor"
import { LivePreview } from "@/components/appearance/live-preview"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Theme } from "@/types/theme"

interface AppearanceEditorProps {
  initialTheme: Theme | null
  initialCustom: Partial<Theme> | null
  systemThemes: Theme[]
}

export function AppearanceEditor({ initialTheme, initialCustom, systemThemes }: AppearanceEditorProps) {
  const { init, save, isDirty } = useAppearanceStore()

  useEffect(() => {
    init(initialTheme, initialCustom)
  }, [initialTheme, initialCustom, init])

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Editor Column */}
      <div className="flex-1 overflow-y-auto border-r bg-white">
        <div className="p-6 space-y-8 pb-24">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Appearance</h1>
            <Button onClick={() => save()} disabled={!isDirty}>
              {isDirty ? 'Save Changes' : 'Saved'}
            </Button>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Themes</h2>
              <ThemeGallery themes={systemThemes} />
            </section>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="background">
                <AccordionTrigger>Background</AccordionTrigger>
                <AccordionContent>
                  <BackgroundEditor />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="buttons">
                <AccordionTrigger>Buttons</AccordionTrigger>
                <AccordionContent>
                  <CardEditor />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="fonts">
                <AccordionTrigger>Fonts</AccordionTrigger>
                <AccordionContent>
                  <FontEditor />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="hidden lg:block w-[450px] bg-gray-50 border-l">
        <LivePreview />
      </div>
    </div>
  )
}
