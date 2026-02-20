import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, profile, isAdmin, signOut } = useAuth()

    return (
        <nav className="bg-[var(--color-surface-light)] border-b border-[var(--color-surface-lighter)] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-lg">🖨️</span>
                </div>
                <span className="text-lg font-bold text-white hidden sm:inline">Laboratorio de prototipado 3D</span>
            </div>

            {/* Nav links */}
            {user && (
                <div className="flex items-center gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]'
                                : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-lighter)]'
                            }`
                        }
                    >
                        📅 Calendario
                    </NavLink>

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin/reservas"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]'
                                        : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-lighter)]'
                                    }`
                                }
                            >
                                📋 Reservas
                            </NavLink>
                            <NavLink
                                to="/stats"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]'
                                        : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-lighter)]'
                                    }`
                                }
                            >
                                📊 Estadísticas
                            </NavLink>
                        </>
                    )}
                </div>
            )}

            {/* User & sign out */}
            {user && (
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm text-white font-medium">{profile?.nombre_completo}</span>
                        <span className={`text-xs ${isAdmin ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                            {isAdmin ? '⚡ Admin' : 'Alumno'}
                        </span>
                    </div>
                    <button
                        onClick={signOut}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition"
                    >
                        Salir
                    </button>
                </div>
            )}
        </nav>
    )
}
