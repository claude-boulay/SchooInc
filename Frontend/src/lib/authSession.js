export function getAuthToken() {
    return localStorage.getItem('schoolinc_token')
}

export function getAuthUser() {
    const raw = localStorage.getItem('schoolinc_user')
    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function isAuthenticated() {
    return Boolean(getAuthToken())
}

export function clearAuthSession() {
    localStorage.removeItem('schoolinc_token')
    localStorage.removeItem('schoolinc_user')
}

export function hasRole(role) {
    const user = getAuthUser()
    return user?.role === role
}

export function updateStoredAuthUser(partialUser) {
    const currentUser = getAuthUser()
    if (!currentUser) {
        return null
    }

    const updatedUser = {
        ...currentUser,
        ...partialUser,
    }

    localStorage.setItem('schoolinc_user', JSON.stringify(updatedUser))
    return updatedUser
}
