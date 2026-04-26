
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from './redux/store'
import { setupJwtInterceptors } from './config/axiosJWT'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import CourseManagement from './pages/CourseManagement'
import StudentManagement from './pages/StudentManagement'
import ClassManagement from './pages/ClassManagement'
import ScoreManagement from './pages/ScoreManagement'
import ScheduleManagement from './pages/ScheduleManagement'
import AttendancePage from './pages/AttendancePage'
import TuitionManagement from './pages/TuitionManagement'



import MainLayout from './components/Home/MainLayout'
import ProtectedRoute, { AuthRoute, GuestRoute, AdminRoute } from './components/ProtectedRoute'


// Setup axios interceptors once
setupJwtInterceptors(store)

function App() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <Router>
        <Routes>
          {/* Public Routes with Header/Footer */}
          <Route path='/' element={<MainLayout />}>
            <Route path='' element={<HomePage />} />
            <Route
              path='courses'
              element={
                <AuthRoute>
                  <CourseManagement />
                </AuthRoute>
              }
            />
            <Route
              path='students'
              element={
                <AuthRoute>
                  <StudentManagement />
                </AuthRoute>
              }
            />
            <Route
              path='classes'
              element={
                <AuthRoute>
                  <ClassManagement />
                </AuthRoute>
              }
            />
            <Route
              path='scores'
              element={
                <AuthRoute>
                  <ScoreManagement />
                </AuthRoute>
              }
            />
            <Route
              path='schedule'
              element={
                <AuthRoute>
                  <ScheduleManagement />
                </AuthRoute>
              }
            />
            <Route
              path='attendance'
              element={
                <AuthRoute>
                  <AttendancePage />
                </AuthRoute>
              }
            />
            <Route
              path='tuition'
              element={
                <AuthRoute>
                  <TuitionManagement />
                </AuthRoute>
              }
            />
          </Route>





          {/* Auth Routes (no header/footer) */}
          <Route
            path='/signup'
            element={
              <GuestRoute redirectTo='/'>
                <SignUpPage />
              </GuestRoute>
            }
          />
          <Route
            path='/signin'
            element={
              <GuestRoute redirectTo='/'>
                <SignInPage />
              </GuestRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <AuthRoute>
                <ProfilePage />
              </AuthRoute>
            }
          />
          {/* Fallback to home */}
          <Route path='*' element={<HomePage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App

