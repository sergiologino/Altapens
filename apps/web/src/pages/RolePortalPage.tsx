import { Link } from 'react-router-dom'
import { ActionLink, SectionCard } from '@/shared/ui/primitives'

export const RolePortalPage = () => (
  <div className="portal-page">
    <section className="hero-panel">
      <span className="eyebrow">Altacare / AltaPens</span>
      <h1 className="hero-title">Сервис заботы о близких, а не контроля.</h1>
      <p className="hero-description">
        Два понятных режима в одном приложении: крупный и спокойный экран для пожилого человека и
        удобная панель для детей и родственников.
      </p>
      <div className="button-row">
        <ActionLink to="/auth/login">Войти</ActionLink>
        <ActionLink to="/auth/register" tone="secondary">
          Создать профиль
        </ActionLink>
        <ActionLink to="/auth/invite" tone="ghost">
          Принять приглашение
        </ActionLink>
      </div>
      <div className="button-row wrap-row">
        <ActionLink to="/auth/login?role=senior" tone="secondary">
          Вход как подопечный
        </ActionLink>
        <ActionLink to="/auth/login?role=caregiver" tone="secondary">
          Вход как родственник
        </ActionLink>
      </div>
      <p className="portal-onboarding-link">
        <Link to="/welcome?replay=1">Как устроено приложение — коротко показать снова</Link>
      </p>
    </section>

    <div className="portal-grid">
      <SectionCard tone="warm">
        <h2 className="section-title">Для пожилого человека</h2>
        <p className="section-description">
          Один экран — одно дело. Крупные кнопки и буквы, напоминания о лекарствах, кнопка помощи и
          защита от обманщиков по телефону.
        </p>
      </SectionCard>
      <SectionCard tone="accent">
        <h2 className="section-title">Для детей и родственников</h2>
        <p className="section-description">
          Сводка о близких: как они себя чувствуют, что с лекарствами, что произошло за день и
          короткие подсказки от умного помощника — без ощущения «надзора».
        </p>
      </SectionCard>
    </div>
  </div>
)
