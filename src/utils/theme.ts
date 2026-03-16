export type PrimaryColor = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink'

interface ColorVariants {
  primary: string
  secondary: string
  muted: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
}

interface ColorTheme {
  light: ColorVariants
  dark: ColorVariants
}

export const colorMap: Record<PrimaryColor, ColorTheme> = {
  cyan: {
    light: {
      primary: '183 70% 42%',
      secondary: '183 15% 96%',
      muted: '183 10% 96%',
      accent: '183 55% 91%',
      accentForeground: '183 70% 22%',
      border: '183 15% 88%',
      input: '183 10% 88%',
      ring: '183 70% 42%'
    },
    dark: {
      primary: '183 72% 52%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '183 20% 18%',
      accentForeground: '183 72% 68%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '183 72% 52%'
    }
  },
  blue: {
    light: {
      primary: '217 91% 56%',
      secondary: '217 15% 96%',
      muted: '217 10% 96%',
      accent: '217 55% 91%',
      accentForeground: '217 91% 28%',
      border: '217 15% 88%',
      input: '217 10% 88%',
      ring: '217 91% 56%'
    },
    dark: {
      primary: '217 88% 62%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '217 20% 18%',
      accentForeground: '217 88% 75%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '217 88% 62%'
    }
  },
  purple: {
    light: {
      primary: '262 83% 54%',
      secondary: '262 15% 96%',
      muted: '262 10% 96%',
      accent: '262 55% 91%',
      accentForeground: '262 83% 28%',
      border: '262 15% 88%',
      input: '262 10% 88%',
      ring: '262 83% 54%'
    },
    dark: {
      primary: '262 78% 65%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '262 18% 18%',
      accentForeground: '262 78% 76%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '262 78% 65%'
    }
  },
  green: {
    light: {
      primary: '142 72% 34%',
      secondary: '142 15% 96%',
      muted: '142 10% 96%',
      accent: '142 55% 91%',
      accentForeground: '142 72% 18%',
      border: '142 15% 88%',
      input: '142 10% 88%',
      ring: '142 72% 34%'
    },
    dark: {
      primary: '142 68% 46%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '142 18% 17%',
      accentForeground: '142 68% 62%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '142 68% 46%'
    }
  },
  orange: {
    light: {
      primary: '24 90% 48%',
      secondary: '24 15% 96%',
      muted: '24 10% 96%',
      accent: '24 55% 91%',
      accentForeground: '24 90% 24%',
      border: '24 15% 88%',
      input: '24 10% 88%',
      ring: '24 90% 48%'
    },
    dark: {
      primary: '24 90% 56%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '24 18% 17%',
      accentForeground: '24 90% 70%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '24 90% 56%'
    }
  },
  pink: {
    light: {
      primary: '330 78% 56%',
      secondary: '330 15% 96%',
      muted: '330 10% 96%',
      accent: '330 55% 91%',
      accentForeground: '330 78% 28%',
      border: '330 15% 88%',
      input: '330 10% 88%',
      ring: '330 78% 56%'
    },
    dark: {
      primary: '330 76% 65%',
      secondary: '220 8% 15%',
      muted: '220 8% 15%',
      accent: '330 18% 18%',
      accentForeground: '330 76% 76%',
      border: '220 8% 20%',
      input: '220 8% 16%',
      ring: '330 76% 65%'
    }
  }
}

/**
 * 应用主题颜色到 CSS 变量
 * @param color 主题颜色名称
 */
export function applyPrimaryColor(color: PrimaryColor): void {
  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  const colors = isDark ? colorMap[color].dark : colorMap[color].light

  // Apply colors to CSS variables
  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--secondary', colors.secondary)
  root.style.setProperty('--muted', colors.muted)
  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--accent-foreground', colors.accentForeground)
  root.style.setProperty('--border', colors.border)
  root.style.setProperty('--input', colors.input)
  root.style.setProperty('--ring', colors.ring)
}
