import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, getToken, setToken, clearToken } from '../api/client'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!getToken()) { setUser(null); return null }
        try {
            const res = await authApi.me()
            const admin = res.data?.admin
            setUser(admin || null)
            return admin
        } catch {
            clearToken()
            setUser(null)
            return null
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        const init = async () => {
            await refresh()
            if (!cancelled) setLoading(false)
        }
        init()
        return () => { cancelled = true }
    }, [refresh])

    const signIn = async (email, password) => {
        try {
            const res = await authApi.login(email, password)
            if (!res.data || typeof res.data !== 'object') {
                return { success: false, message: 'Login API returned an unexpected response. Check VITE_API_URL in production.' }
            }
            const { token, admin } = res.data || {}
            if (!token) return { success: false, message: res.data.message || 'Login API did not return a token. Check the production API URL.' }
            setToken(token)
            setUser(admin || null)
            return { success: true, admin }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message || 'Login failed' }
        }
    }

    const signOut = async () => {
        clearToken()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
