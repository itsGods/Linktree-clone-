"use client"

import { useTheme } from "@/context/theme-context"
import { ThemeGallery } from "@/components/appearance/theme-gallery"
import { BackgroundEditor } from "@/components/appearance/background-editor"
import { CardEditor } from "@/components/appearance/card-editor"
import { FontEditor } from "@/components/appearance/font-editor"
import { LayoutEditor } from "@/components/appearance/layout-editor"
import { AnimationEditor } from "@/components/appearance/animation-editor"
import { ProfilePreview } from "@/components/preview/ProfilePreview"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AppearanceEditor() {
  const { saveTheme, isSaving } = useTheme()

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Editor Column */}
      <div className="flex-1 overflow-y-auto border-r bg-white">
        <div className="p-6 space-y-8 pb-24">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Appearance</h1>
            <Button onClick={() => saveTheme()} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Themes</h2>
              <ThemeGallery />
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

              <AccordionItem value="layout">
                <AccordionTrigger>Layout</AccordionTrigger>
                <AccordionContent>
                  <LayoutEditor />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="animations">
                <AccordionTrigger>Animations</AccordionTrigger>
                <AccordionContent>
                  <AnimationEditor />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="hidden lg:flex w-[450px] bg-gray-50 border-l items-center justify-center p-8">
        <ProfilePreview />
      </div>
    </div>
  )
}
