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
            // Check for mock session first
            const mockSession = localStorage.getItem('sr_admin_session')
            if (mockSession) {
                setUser(JSON.parse(mockSession))
                setLoading(false)
                return
            }

            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
            } catch (err) {
                console.warn('Supabase session check failed (using placeholders?):', err.message)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Listen for changes on auth state (logged in, signed out, etc.)
        let subscription = null;
        try {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!localStorage.getItem('sr_admin_session')) {
                    setUser(session?.user ?? null)
                    setLoading(false)
                }
            })
            subscription = data?.subscription;
        } catch (err) {
            console.warn('Supabase auth listener failed:', err.message)
        }

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
