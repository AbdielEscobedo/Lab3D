import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (isRegister) {
                if (!name.trim()) {
                    setError('Ingresa tu nombre completo.')
                    setLoading(false)
                    return
                }
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden.')
                    setLoading(false)
                    return
                }
                await signUp(email, password, name)
                setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.')
            } else {
                await signIn(email, password)
                navigate('/')
            }
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                        <span className="text-3xl">🖨️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">WebLab 3D</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Laboratorio de Impresión 3D</p>
                </div>

                {/* Form card */}
                <div className="bg-[var(--color-surface-light)] rounded-2xl p-8 border border-[var(--color-surface-lighter)] shadow-xl">
                    <h2 className="text-lg font-semibold text-white mb-6">
                        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-surface-lighter)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alumno@universidad.edu"
                                required
                                className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-surface-lighter)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-surface-lighter)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--color-surface-lighter)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        >
                            {loading
                                ? 'Cargando…'
                                : isRegister
                                    ? 'Crear Cuenta'
                                    : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister)
                                setError('')
                                setSuccess('')
                            }}
                            className="text-sm text-[var(--color-primary-light)] hover:text-white transition"
                        >
                            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
