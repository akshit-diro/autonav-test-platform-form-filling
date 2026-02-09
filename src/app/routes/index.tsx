import { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../../auth/ProtectedRoute'
import { ScenarioRouteGuard } from '../../auth/ScenarioRouteGuard'
import { HomePage } from './HomePage'
import { LoginPage } from './LoginPage'
import { NotAuthorizedPage } from './NotAuthorizedPage'
import { AdminPage } from './AdminPage'
import { ScenarioPage } from './ScenarioPage'
import { StatementsPage } from './StatementsPage'
import { ProfilePage } from './ProfilePage'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/not-authorized',
    element: <NotAuthorizedPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'statements',
        element: <StatementsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute requiredScenario="admin" />,
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
    ],
  },
  {
    path: '/scenario/:scenarioId',
    element: <ScenarioRouteGuard />,
    children: [
      {
        index: true,
        element: <ScenarioPage />,
      },
    ],
  },
]
