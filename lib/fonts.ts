import { Inter, Poppins, DM_Sans, Space_Grotesk, Outfit, Plus_Jakarta_Sans, Playfair_Display, Montserrat } from 'next/font/google'

export const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const fontPoppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' })
export const fontDMSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
export const fontSpaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
export const fontOutfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
export const fontPlusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' })
export const fontPlayfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
export const fontMontserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const fonts = {
  'Inter': fontInter,
  'Poppins': fontPoppins,
  'DM Sans': fontDMSans,
  'Space Grotesk': fontSpaceGrotesk,
  'Outfit': fontOutfit,
  'Plus Jakarta Sans': fontPlusJakarta,
  'Playfair Display': fontPlayfair,
  'Montserrat': fontMontserrat,
}

export const fontClassNames = Object.values(fonts).map(f => f.variable).join(' ')
