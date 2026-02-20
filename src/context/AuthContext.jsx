import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const safeSetState = (u, p, l) => {
            if (!mounted) return
            setUser(u)
            setProfile(p)
            setLoading(l)
        }

        async function fetchAndSetProfile(sessionUser) {
            try {
                const { data, error } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    console.error("Profile fetch error:", error)
                }
                safeSetState(sessionUser, data || null, false)
            } catch (err) {
                safeSetState(sessionUser, null, false)
            }
        }

        // Set up listener (this automatically fires an INITIAL_SESSION event)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                    await fetchAndSetProfile(session.user)
                } else {
                    safeSetState(null, null, false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email, password, nombreCompleto) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre_completo: nombreCompleto,
                },
            },
        })
        if (error) throw error
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
