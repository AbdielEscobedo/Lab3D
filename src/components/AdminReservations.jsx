import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminReservations() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const fetchAll = async () => {
        setLoading(true)
        let query = supabase
            .from('reservas')
            .select('*, perfiles(nombre_completo, email), maquinas(nombre)')
            .order('inicio', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data } = await query
        setReservations(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchAll()
    }, [filter])

    const handleVerify = async (id) => {
        await supabase.from('reservas').update({ status: 'confirmada' }).eq('id', id)
        fetchAll()
    }

    const handleComplete = async (id) => {
        await supabase.from('reservas').update({ status: 'completada' }).eq('id', id)
        fetchAll()
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta reserva?')) return
        await supabase.from('reservas').delete().eq('id', id)
        fetchAll()
    }

    const formatDate = (iso) => {
        const d = new Date(iso)
        return d.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const statusBadge = (status) => {
        const colors = {
            pendiente: 'bg-amber-500/20 text-amber-400',
            confirmada: 'bg-emerald-500/20 text-emerald-400',
            completada: 'bg-slate-500/20 text-slate-400',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || ''}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="bg-[var(--color-surface-light)] rounded-2xl p-6 border border-[var(--color-surface-lighter)] shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    📋 Gestión de Reservas
                </h2>

                <div className="flex gap-2">
                    {['all', 'pendiente', 'confirmada', 'completada'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
                                }`}
                        >
                            {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-[var(--color-text-muted)]">Cargando…</div>
            ) : reservations.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)]">No hay reservas.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-surface-lighter)]">
                                <th className="py-3 px-2">Alumno</th>
                                <th className="py-3 px-2">Máquina</th>
                                <th className="py-3 px-2">Inicio</th>
                                <th className="py-3 px-2">Fin</th>
                                <th className="py-3 px-2">Estado</th>
                                <th className="py-3 px-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-[var(--color-surface-lighter)] hover:bg-[var(--color-surface)]/50 transition"
                                >
                                    <td className="py-3 px-2">
                                        <div className="font-medium text-white">{r.perfiles?.nombre_completo || '—'}</div>
                                        {r.perfiles?.email && <div className="text-xs text-[var(--color-text-muted)]">{r.perfiles.email}</div>}
                                    </td>
                                    <td className="py-3 px-2 text-[var(--color-accent)]">{r.maquinas?.nombre || '—'}</td>
                                    <td className="py-3 px-2 text-[var(--color-text-muted)]">{formatDate(r.inicio)}</td>
                                    <td className="py-3 px-2 text-[var(--color-text-muted)]">{formatDate(r.fin)}</td>
                                    <td className="py-3 px-2">{statusBadge(r.status)}</td>
                                    <td className="py-3 px-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {r.status === 'pendiente' && (
                                                <button
                                                    onClick={() => handleVerify(r.id)}
                                                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition"
                                                >
                                                    ✓ Verificar
                                                </button>
                                            )}
                                            {r.status === 'confirmada' && (
                                                <button
                                                    onClick={() => handleComplete(r.id)}
                                                    className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-medium transition"
                                                >
                                                    ✓ Completar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition"
                                            >
                                                ✕ Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
