import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppEntryPage, PublicOnlyRoute, RequireRole } from '@/app/router/guards'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { RolePortalPage } from '@/pages/RolePortalPage'
import { AuthLayout, InvitePage, LoginPage, RegisterPage } from '@/pages/auth'
import {
  CaregiverAssistantPage,
  CaregiverDashboardPage,
  CaregiverEventsPage,
  CaregiverInviteCreatePage,
  CaregiverLayout,
  CaregiverMedicationFormPage,
  CaregiverSeniorDetailPage,
  CaregiverSeniorsPage,
  CaregiverSettingsPage,
} from '@/pages/caregiver'
import {
  SeniorAntiScamPage,
  SeniorAssistantPage,
  SeniorHistoryPage,
  SeniorHomePage,
  SeniorLayout,
  SeniorProfilePage,
  SeniorSosPage,
  SeniorTodayPage,
} from '@/pages/senior'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppEntryPage />,
  },
  {
    path: '/welcome',
    element: <OnboardingPage />,
  },
  {
    path: '/start',
    element: <RolePortalPage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      { path: 'invite', element: <InvitePage /> },
    ],
  },
  {
    path: '/senior',
    element: (
      <RequireRole role="senior">
        <SeniorLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <SeniorHomePage /> },
      { path: 'today', element: <SeniorTodayPage /> },
      { path: 'assistant', element: <SeniorAssistantPage /> },
      { path: 'history', element: <SeniorHistoryPage /> },
      { path: 'profile', element: <SeniorProfilePage /> },
      { path: 'sos', element: <SeniorSosPage /> },
      { path: 'anti-scam', element: <SeniorAntiScamPage /> },
    ],
  },
  {
    path: '/caregiver',
    element: (
      <RequireRole role="caregiver">
        <CaregiverLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <CaregiverDashboardPage /> },
      { path: 'seniors', element: <CaregiverSeniorsPage /> },
      { path: 'seniors/:seniorId', element: <CaregiverSeniorDetailPage /> },
      { path: 'invites/new', element: <CaregiverInviteCreatePage /> },
      { path: 'medications/new', element: <CaregiverMedicationFormPage /> },
      { path: 'events', element: <CaregiverEventsPage /> },
      { path: 'assistant', element: <CaregiverAssistantPage /> },
      { path: 'settings', element: <CaregiverSettingsPage /> },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
