export type PrimaryColor = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink'

interface ColorVariants {
  primary: string
  primaryForeground: string
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

// Apple System Colors 参考 (Dark Mode):
//   Cyan   #5AC8FA → hsl(200 93% 66%)
//   Blue   #0A84FF → hsl(211 100% 52%)
//   Purple #BF5AF2 → hsl(283 85% 64%)
//   Green  #30D158 → hsl(142 64% 50%)
//   Orange #FF9F0A → hsl(37 100% 52%)
//   Pink   #FF375F → hsl(349 100% 61%)
//   Red    #FF453A → hsl(3 100% 61%)

export const colorMap: Record<PrimaryColor, ColorTheme> = {
  cyan: {
    light: {
      primary: '183 70% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '183 15% 96%',
      muted: '183 10% 96%',
      accent: '183 55% 91%',
      accentForeground: '183 70% 22%',
      border: '183 15% 88%',
      input: '183 10% 88%',
      ring: '183 70% 42%'
    },
    dark: {
      // Apple System Cyan: #5AC8FA
      primary: '200 93% 66%',
      primaryForeground: '240 3% 8%',   /* 青色较亮，用深色文字 */
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '200 30% 18%',
      accentForeground: '200 93% 72%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '200 93% 66%'
    }
  },
  blue: {
    light: {
      primary: '211 95% 52%',
      primaryForeground: '0 0% 100%',
      secondary: '211 15% 96%',
      muted: '211 10% 96%',
      accent: '211 55% 91%',
      accentForeground: '211 95% 28%',
      border: '211 15% 88%',
      input: '211 10% 88%',
      ring: '211 95% 52%'
    },
    dark: {
      // Apple System Blue: #0A84FF
      primary: '211 100% 52%',
      primaryForeground: '0 0% 100%',
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '211 40% 17%',
      accentForeground: '211 100% 72%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '211 100% 52%'
    }
  },
  purple: {
    light: {
      primary: '262 83% 54%',
      primaryForeground: '0 0% 100%',
      secondary: '262 15% 96%',
      muted: '262 10% 96%',
      accent: '262 55% 91%',
      accentForeground: '262 83% 28%',
      border: '262 15% 88%',
      input: '262 10% 88%',
      ring: '262 83% 54%'
    },
    dark: {
      // Apple System Purple: #BF5AF2
      primary: '283 85% 64%',
      primaryForeground: '0 0% 100%',
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '283 30% 18%',
      accentForeground: '283 85% 78%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '283 85% 64%'
    }
  },
  green: {
    light: {
      primary: '142 72% 34%',
      primaryForeground: '0 0% 100%',
      secondary: '142 15% 96%',
      muted: '142 10% 96%',
      accent: '142 55% 91%',
      accentForeground: '142 72% 18%',
      border: '142 15% 88%',
      input: '142 10% 88%',
      ring: '142 72% 34%'
    },
    dark: {
      // Apple System Green: #30D158
      primary: '142 64% 50%',
      primaryForeground: '0 0% 100%',
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '142 28% 16%',
      accentForeground: '142 64% 66%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '142 64% 50%'
    }
  },
  orange: {
    light: {
      primary: '32 95% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '32 15% 96%',
      muted: '32 10% 96%',
      accent: '32 55% 91%',
      accentForeground: '32 95% 24%',
      border: '32 15% 88%',
      input: '32 10% 88%',
      ring: '32 95% 48%'
    },
    dark: {
      // Apple System Orange: #FF9F0A
      primary: '37 100% 52%',
      primaryForeground: '240 3% 8%',   /* 橙色较亮，用深色文字 */
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '37 35% 16%',
      accentForeground: '37 100% 68%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '37 100% 52%'
    }
  },
  pink: {
    light: {
      primary: '349 80% 54%',
      primaryForeground: '0 0% 100%',
      secondary: '349 15% 96%',
      muted: '349 10% 96%',
      accent: '349 55% 91%',
      accentForeground: '349 80% 28%',
      border: '349 15% 88%',
      input: '349 10% 88%',
      ring: '349 80% 54%'
    },
    dark: {
      // Apple System Pink: #FF375F
      primary: '349 100% 61%',
      primaryForeground: '0 0% 100%',
      secondary: '240 2% 17%',
      muted: '240 2% 17%',
      accent: '349 35% 17%',
      accentForeground: '349 100% 75%',
      border: '240 2% 23%',
      input: '240 2% 18%',
      ring: '349 100% 61%'
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

  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--primary-foreground', colors.primaryForeground)
  root.style.setProperty('--secondary', colors.secondary)
  root.style.setProperty('--muted', colors.muted)
  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--accent-foreground', colors.accentForeground)
  root.style.setProperty('--border', colors.border)
  root.style.setProperty('--input', colors.input)
  root.style.setProperty('--ring', colors.ring)
}
