import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClassesPublicPage from './pages/ClassesPublicPage'
import CoursesPublicPage from './pages/CoursesPublicPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import StudentGradesPage from './pages/StudentGradesPage'
import StudentCoursesPage from './pages/StudentCoursesPage'
import StudentClassesPage from './pages/StudentClassesPage'
import ProfessorDashboardPage from './pages/ProfessorDashboardPage'
import ProfessorClassesPage from './pages/ProfessorClassesPage'
import ProfessorCoursesPage from './pages/ProfessorCoursesPage'
import ProfessorGradesPage from './pages/ProfessorGradesPage'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

function LayoutOutlet() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    )
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route element={<LayoutOutlet />}>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/classes" element={<ClassesPublicPage />} />
                    <Route path="/courses" element={<CoursesPublicPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/change-password" element={<ChangePasswordPage />} />

                        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                            <Route path="/student/grades" element={<StudentGradesPage />} />
                            <Route path="/student/courses" element={<StudentCoursesPage />} />
                            <Route path="/student/classes" element={<StudentClassesPage />} />
                        </Route>

                        <Route element={<RoleRoute allowedRoles={['PROFESSOR']} />}>
                            <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
                            <Route path="/professor/classes" element={<ProfessorClassesPage />} />
                            <Route path="/professor/courses" element={<ProfessorCoursesPage />} />
                            <Route path="/professor/grades" element={<ProfessorGradesPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}

export default App
