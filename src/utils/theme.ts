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
      primary: '183 70% 45%',
      secondary: '183 15% 96%',
      muted: '183 10% 96%',
      accent: '183 60% 92%',
      accentForeground: '183 70% 25%',
      border: '183 15% 89%',
      input: '183 10% 89%',
      ring: '183 70% 45%'
    },
    dark: {
      primary: '183 70% 50%',
      secondary: '183 8% 15%',
      muted: '183 8% 15%',
      accent: '183 30% 20%',
      accentForeground: '183 70% 70%',
      border: '183 15% 20%',
      input: '183 10% 20%',
      ring: '183 70% 50%'
    }
  },
  blue: {
    light: {
      primary: '217 91% 60%',
      secondary: '217 15% 96%',
      muted: '217 10% 96%',
      accent: '217 60% 92%',
      accentForeground: '217 91% 30%',
      border: '217 15% 89%',
      input: '217 10% 89%',
      ring: '217 91% 60%'
    },
    dark: {
      primary: '217 91% 65%',
      secondary: '217 8% 15%',
      muted: '217 8% 15%',
      accent: '217 30% 20%',
      accentForeground: '217 91% 75%',
      border: '217 15% 20%',
      input: '217 10% 20%',
      ring: '217 91% 65%'
    }
  },
  purple: {
    light: {
      primary: '262 83% 58%',
      secondary: '262 15% 96%',
      muted: '262 10% 96%',
      accent: '262 60% 92%',
      accentForeground: '262 83% 30%',
      border: '262 15% 89%',
      input: '262 10% 89%',
      ring: '262 83% 58%'
    },
    dark: {
      primary: '262 83% 63%',
      secondary: '262 8% 15%',
      muted: '262 8% 15%',
      accent: '262 30% 20%',
      accentForeground: '262 83% 73%',
      border: '262 15% 20%',
      input: '262 10% 20%',
      ring: '262 83% 63%'
    }
  },
  green: {
    light: {
      primary: '142 76% 36%',
      secondary: '142 15% 96%',
      muted: '142 10% 96%',
      accent: '142 60% 92%',
      accentForeground: '142 76% 20%',
      border: '142 15% 89%',
      input: '142 10% 89%',
      ring: '142 76% 36%'
    },
    dark: {
      primary: '142 76% 45%',
      secondary: '142 8% 15%',
      muted: '142 8% 15%',
      accent: '142 30% 20%',
      accentForeground: '142 76% 60%',
      border: '142 15% 20%',
      input: '142 10% 20%',
      ring: '142 76% 45%'
    }
  },
  orange: {
    light: {
      primary: '24 94% 50%',
      secondary: '24 15% 96%',
      muted: '24 10% 96%',
      accent: '24 60% 92%',
      accentForeground: '24 94% 25%',
      border: '24 15% 89%',
      input: '24 10% 89%',
      ring: '24 94% 50%'
    },
    dark: {
      primary: '24 94% 55%',
      secondary: '24 8% 15%',
      muted: '24 8% 15%',
      accent: '24 30% 20%',
      accentForeground: '24 94% 70%',
      border: '24 15% 20%',
      input: '24 10% 20%',
      ring: '24 94% 55%'
    }
  },
  pink: {
    light: {
      primary: '330 81% 60%',
      secondary: '330 15% 96%',
      muted: '330 10% 96%',
      accent: '330 60% 92%',
      accentForeground: '330 81% 30%',
      border: '330 15% 89%',
      input: '330 10% 89%',
      ring: '330 81% 60%'
    },
    dark: {
      primary: '330 81% 65%',
      secondary: '330 8% 15%',
      muted: '330 8% 15%',
      accent: '330 30% 20%',
      accentForeground: '330 81% 75%',
      border: '330 15% 20%',
      input: '330 10% 20%',
      ring: '330 81% 65%'
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
