import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
            } catch (err) {
                console.error('Supabase session check failed:', err.message)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription?.unsubscribe()
    }, [])

    const signOut = async () => {
        // Clear mock session
        localStorage.removeItem('sr_admin_session')
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Error signing out:', error)
        setUser(null)
    }

    const value = {
        user,
        signOut,
        setUser,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
