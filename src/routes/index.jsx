/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createHashRouter, Outlet } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RouteLoading from '@/components/layout/RouteLoading'
import NotFound from '@/pages/NotFound'

// Every page is lazy-loaded so the initial bundle stays small and each
// route's JS is fetched on first visit (RouteLoading is the Suspense
// fallback while that chunk downloads).
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'))
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage'))
const PomodoroPage = lazy(() => import('@/pages/pomodoro/PomodoroPage'))
const ArcadePage = lazy(() => import('@/pages/arcade/ArcadePage'))
const WhiteboardPage = lazy(() => import('@/pages/whiteboard/WhiteboardPage'))
const NotesPage = lazy(() => import('@/pages/notes/NotesPage'))
const NoteDetailPage = lazy(() => import('@/pages/notes/NoteDetailPage'))
const JournalPage = lazy(() => import('@/pages/journal/JournalPage'))
const WorkoutPage = lazy(() => import('@/pages/workout/WorkoutPage'))
const WorkoutDetailPage = lazy(() => import('@/pages/workout/WorkoutDetailPage'))
const WorkoutSchedulePage = lazy(() => import('@/pages/workout/WorkoutSchedulePage'))
const WorkoutScheduleDetailPage = lazy(() => import('@/pages/workout/WorkoutScheduleDetailPage'))
const FinancePage = lazy(() => import('@/pages/finance/FinancePage'))
const TransactionDetailPage = lazy(() => import('@/pages/finance/TransactionDetailPage'))
const BrainstormPage = lazy(() => import('@/pages/brainstorm/BrainstormPage'))
const BrainstormDetailPage = lazy(() => import('@/pages/brainstorm/BrainstormDetailPage'))
const VaultPage = lazy(() => import('@/pages/vault/VaultPage'))
const HabitsPage = lazy(() => import('@/pages/habits/HabitsPage'))
const HabitDetailPage = lazy(() => import('@/pages/habits/HabitDetailPage'))
const GoalsPage = lazy(() => import('@/pages/goals/GoalsPage'))
const LearningPage = lazy(() => import('@/pages/learning/LearningPage'))
const LearningDetailPage = lazy(() => import('@/pages/learning/LearningDetailPage'))
const VisionBoardPage = lazy(() => import('@/pages/visionboard/VisionBoardPage'))
const VisionBoardDetailPage = lazy(() => import('@/pages/visionboard/VisionBoardDetailPage'))
const MoviesPage = lazy(() => import('@/pages/movies/MoviesPage'))
const MovieDetailPage = lazy(() => import('@/pages/movies/MovieDetailPage'))
const LibraryPage = lazy(() => import('@/pages/library/LibraryPage'))
const BookmarksPage = lazy(() => import('@/pages/bookmarks/BookmarksPage'))
const FilesPage = lazy(() => import('@/pages/files/FilesPage'))
const DevToolsPage = lazy(() => import('@/pages/devtools/DevToolsPage'))
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const AssistantPage = lazy(() => import('@/pages/assistant/AssistantPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))

// One Suspense boundary around every lazy page below.
function RootLayout() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
  )
}

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        index: true,
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'pomodoro', element: <PomodoroPage /> },
          { path: 'arcade', element: <ArcadePage /> },
          { path: 'whiteboard', element: <WhiteboardPage /> },
          { path: 'notes', element: <NotesPage /> },
          { path: 'notes/:id', element: <NoteDetailPage /> },
          { path: 'journal', element: <JournalPage /> },
          { path: 'workout', element: <WorkoutPage /> },
          { path: 'workout/schedule', element: <WorkoutSchedulePage /> },
          { path: 'workout/schedule/:id', element: <WorkoutScheduleDetailPage /> },
          { path: 'workout/:id', element: <WorkoutDetailPage /> },
          { path: 'finance', element: <FinancePage /> },
          { path: 'finance/:id', element: <TransactionDetailPage /> },
          { path: 'brainstorm', element: <BrainstormPage /> },
          { path: 'brainstorm/:id', element: <BrainstormDetailPage /> },
          { path: 'vault', element: <VaultPage /> },
          { path: 'habits', element: <HabitsPage /> },
          { path: 'habits/:id', element: <HabitDetailPage /> },
          { path: 'goals', element: <GoalsPage /> },
          { path: 'learning', element: <LearningPage /> },
          { path: 'learning/:id', element: <LearningDetailPage /> },
          { path: 'vision-board', element: <VisionBoardPage /> },
          { path: 'vision-board/:id', element: <VisionBoardDetailPage /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'movies', element: <MoviesPage /> },
          { path: 'movies/:id', element: <MovieDetailPage /> },
          { path: 'bookmarks', element: <BookmarksPage /> },
          { path: 'files', element: <FilesPage /> },
          { path: 'devtools', element: <DevToolsPage /> },
          { path: 'assistant', element: <AssistantPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])