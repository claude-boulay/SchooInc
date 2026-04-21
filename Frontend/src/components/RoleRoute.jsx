import { Navigate, Outlet } from 'react-router-dom'
import { getAuthUser } from '../lib/authSession'

export default function RoleRoute({ allowedRoles }) {
    const user = getAuthUser()

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
