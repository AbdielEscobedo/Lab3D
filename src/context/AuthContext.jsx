import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true;
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error
                if (mounted) {
                    setUser(session?.user ?? null)
                    if (session?.user) await fetchProfile(session.user.id)
                    else setLoading(false)
                }
            } catch (error) {
                console.error("Error initializing auth:", error)
                if (mounted) setLoading(false)
            }
        }
        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return
                setUser(session?.user ?? null)
                if (session?.user) await fetchProfile(session.user.id)
                else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .single()
            if (error && error.code !== 'PGRST116') {
                console.error("fetchProfile error:", error)
            }
            setProfile(data)
        } catch (error) {
            console.error("fetchProfile threw:", error)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, nombreCompleto) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
            await supabase.from('perfiles').insert({
                id: data.user.id,
                nombre_completo: nombreCompleto,
                rol: 'alumno',
            })
        }
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    const isAdmin = profile?.rol === 'admin'

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
