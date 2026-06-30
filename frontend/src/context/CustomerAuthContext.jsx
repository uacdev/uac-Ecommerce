import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { customerApi, getCustomerToken, setCustomerToken, clearCustomerToken } from '../api/client'

const CustomerAuthContext = createContext()

export const useCustomerAuth = () => useContext(CustomerAuthContext)

export const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!getCustomerToken()) { setCustomer(null); return null }
        try {
            const res = await customerApi.me()
            const c = res.data?.customer
            setCustomer(c || null)
            return c
        } catch {
            clearCustomerToken()
            setCustomer(null)
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
            const res = await customerApi.login(email, password)
            if (!res.data || typeof res.data !== 'object') {
                return { success: false, message: 'Login API returned an unexpected response. Check VITE_API_URL in production.' }
            }
            const { token, customer: c } = res.data || {}
            if (!token) return { success: false, message: res.data.message || 'Login API did not return a token. Check the production API URL.' }
            setCustomerToken(token)
            setCustomer(c || null)
            return { success: true, customer: c }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message || 'Sign-in failed' }
        }
    }

    const signUp = async (data) => {
        try {
            const res = await customerApi.signup(data)
            if (!res.data || typeof res.data !== 'object') {
                return { success: false, message: 'Signup API returned an unexpected response. Check VITE_API_URL in production.' }
            }
            const { token, customer: c } = res.data || {}
            if (!token) return { success: false, message: res.data.message || 'Signup API did not return a token. Check the production API URL.' }
            setCustomerToken(token)
            setCustomer(c || null)
            return { success: true, customer: c }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message || 'Signup failed' }
        }
    }

    const signOut = () => {
        clearCustomerToken()
        setCustomer(null)
    }

    const updateProfile = async (updates) => {
        try {
            const res = await customerApi.updateProfile(updates)
            const c = res.data?.customer
            if (c) setCustomer(c)
            return { success: !!c, customer: c }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message }
        }
    }

    return (
        <CustomerAuthContext.Provider value={{ customer, loading, signIn, signUp, signOut, refresh, updateProfile }}>
            {children}
        </CustomerAuthContext.Provider>
    )
}
