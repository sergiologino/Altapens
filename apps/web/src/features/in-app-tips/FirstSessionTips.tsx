import { Link } from 'react-router-dom'
import type { UserRole } from '@altapens/shared-types'
import { shouldShowInAppTips, useInAppTipsStore } from '@/app/store/in-app-tips-store'
import { inAppTipsByRole } from '@/features/in-app-tips/in-app-tips-content'
import { ActionButton } from '@/shared/ui/primitives'

type TipsRole = Extract<UserRole, 'caregiver' | 'senior'>

export const FirstSessionTips = ({ role }: { role: TipsRole }) => {
  const versionSeen = useInAppTipsStore((s) => s.versionSeenByRole[role])
  const markTipsSeen = useInAppTipsStore((s) => s.markTipsSeen)

  if (!shouldShowInAppTips(versionSeen)) {
    return null
  }

  const content = inAppTipsByRole[role]

  return (
    <section
      className="first-session-tips"
      aria-labelledby="first-session-tips-title"
    >
      <div className="first-session-tips-inner">
        <div className="first-session-tips-copy">
          <h2 id="first-session-tips-title" className="first-session-tips-title">
            {content.title}
          </h2>
          <p className="first-session-tips-intro">{content.intro}</p>
          <ul className="first-session-tips-list">
            {content.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="first-session-tips-actions">
          <ActionButton type="button" onClick={() => markTipsSeen(role)}>
            Понятно, скрыть подсказки
          </ActionButton>
          <Link className="first-session-tips-link" to="/welcome?replay=1">
            Показать знакомство с приложением снова
          </Link>
        </div>
      </div>
    </section>
  )
}
