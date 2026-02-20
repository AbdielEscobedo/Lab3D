import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        }).catch((err) => {
            console.error("Error getSession:", err)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                // Ignore INITIAL_SESSION if we already handled it via getSession, 
                // but setting state again is harmless and prevents bugs.
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
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
            // Always set profile, even if null, then clear loading
            setProfile(data || null)
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
