import { useUiThemeStore } from '@/app/store/ui-theme-store'
import { ActionButton } from '@/shared/ui/primitives'

export const ThemeToggle = () => {
  const colorScheme = useUiThemeStore((s) => s.colorScheme)
  const setColorScheme = useUiThemeStore((s) => s.setColorScheme)

  return (
    <div className="theme-toggle-row" role="group" aria-label="Тема оформления">
      <ActionButton
        type="button"
        tone={colorScheme === 'light' ? 'primary' : 'secondary'}
        onClick={() => setColorScheme('light')}
      >
        Светлая
      </ActionButton>
      <ActionButton
        type="button"
        tone={colorScheme === 'dark' ? 'primary' : 'secondary'}
        onClick={() => setColorScheme('dark')}
      >
        Тёмная
      </ActionButton>
    </div>
  )
}
