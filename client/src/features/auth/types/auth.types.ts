export interface LoginCredentials {
    email: string
    password: string
    rememberMe: boolean
}

export interface AuthUser {
    id: string
    email: string
    name: string
}

export interface AuthStore {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: AuthUser) => void
    setLoading: (v: boolean) => void
    logout: () => void
}