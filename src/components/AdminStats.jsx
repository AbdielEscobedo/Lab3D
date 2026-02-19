import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminStats() {
    const [machineStats, setMachineStats] = useState([])
    const [studentStats, setStudentStats] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const { data: reservas } = await supabase
            .from('reservas')
            .select('*, perfiles(nombre_completo), maquinas(nombre)')

        if (!reservas) {
            setLoading(false)
            return
        }

        // Hours per machine
        const byMachine = {}
        reservas.forEach((r) => {
            const name = r.maquinas?.nombre || 'Desconocida'
            const hours = (new Date(r.fin) - new Date(r.inicio)) / 3600000
            byMachine[name] = (byMachine[name] || 0) + hours
        })
        setMachineStats(
            Object.entries(byMachine)
                .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }))
                .sort((a, b) => b.hours - a.hours)
        )

        // Hours per student
        const byStudent = {}
        reservas.forEach((r) => {
            const name = r.perfiles?.nombre_completo || 'Desconocido'
            const hours = (new Date(r.fin) - new Date(r.inicio)) / 3600000
            byStudent[name] = (byStudent[name] || 0) + hours
        })
        setStudentStats(
            Object.entries(byStudent)
                .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }))
                .sort((a, b) => b.hours - a.hours)
        )

        setLoading(false)
    }

    const maxMachineHours = Math.max(...machineStats.map((m) => m.hours), 1)
    const maxStudentHours = Math.max(...studentStats.map((s) => s.hours), 1)

    if (loading) {
        return (
            <div className="text-center py-8 text-[var(--color-text-muted)]">Cargando estadísticas…</div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hours per machine */}
            <div className="bg-[var(--color-surface-light)] rounded-2xl p-6 border border-[var(--color-surface-lighter)] shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    🖨️ Horas por Máquina
                </h3>
                {machineStats.length === 0 ? (
                    <p className="text-[var(--color-text-muted)] text-sm">Sin datos aún.</p>
                ) : (
                    <div className="space-y-3">
                        {machineStats.map((m) => (
                            <div key={m.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--color-text)]">{m.name}</span>
                                    <span className="text-[var(--color-accent)] font-semibold">{m.hours}h</span>
                                </div>
                                <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-700"
                                        style={{ width: `${(m.hours / maxMachineHours) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hours per student */}
            <div className="bg-[var(--color-surface-light)] rounded-2xl p-6 border border-[var(--color-surface-lighter)] shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    👤 Horas por Alumno
                </h3>
                {studentStats.length === 0 ? (
                    <p className="text-[var(--color-text-muted)] text-sm">Sin datos aún.</p>
                ) : (
                    <div className="space-y-3">
                        {studentStats.map((s) => (
                            <div key={s.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--color-text)]">{s.name}</span>
                                    <span className="text-[var(--color-primary-light)] font-semibold">{s.hours}h</span>
                                </div>
                                <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] rounded-full transition-all duration-700"
                                        style={{ width: `${(s.hours / maxStudentHours) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
