import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function BookingModal({ machines, selectedInfo, onClose, onBooked }) {
    const { user } = useAuth()
    const [machineId, setMachineId] = useState(selectedInfo?.machineId || '')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [duration, setDuration] = useState(60)
    const [endTime, setEndTime] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Parse selectedInfo into initial values
    useEffect(() => {
        if (selectedInfo?.start) {
            const d = new Date(selectedInfo.start)
            setDate(d.toISOString().split('T')[0])
            setStartTime(d.toTimeString().slice(0, 5))
        }
        if (selectedInfo?.machineId) {
            setMachineId(selectedInfo.machineId)
        }
    }, [selectedInfo])

    // Calculate end time whenever start or duration changes
    useEffect(() => {
        if (date && startTime && duration) {
            const start = new Date(`${date}T${startTime}`)
            const end = new Date(start.getTime() + duration * 60000)
            setEndTime(end.toTimeString().slice(0, 5))
        }
    }, [date, startTime, duration])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        if (!machineId || !date || !startTime || !duration) {
            setError('Completa todos los campos.')
            setSubmitting(false)
            return
        }

        const inicio = new Date(`${date}T${startTime}`).toISOString()
        const fin = new Date(new Date(`${date}T${startTime}`).getTime() + duration * 60000).toISOString()

        // Check for overlapping reservations
        const { data: overlapping } = await supabase
            .from('reservas')
            .select('id')
            .eq('maquina_id', machineId)
            .lt('inicio', fin)
            .gt('fin', inicio)

        if (overlapping && overlapping.length > 0) {
            setError('⚠️ Ya existe una reserva en ese horario para esta máquina. Elige otro horario.')
            setSubmitting(false)
            return
        }

        const { error: insertError } = await supabase.from('reservas').insert({
            alumno_id: user.id,
            maquina_id: machineId,
            inicio,
            fin,
            duracion_estimada: duration,
            status: 'pendiente',
        })

        if (insertError) {
            setError(insertError.message)
            setSubmitting(false)
            return
        }

        onBooked()
    }

    const availableMachines = machines.filter((m) => m.estado === 'disponible')

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Nueva Reserva</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-lighter)] hover:bg-[var(--color-danger)] transition-colors text-[var(--color-text-muted)] hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Machine selector */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Máquina
                        </label>
                        <select
                            value={machineId}
                            onChange={(e) => setMachineId(e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                        >
                            <option value="">Seleccionar máquina…</option>
                            {availableMachines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.nombre} — {m.modelo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                        />
                    </div>

                    {/* Start time */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Hora de inicio
                        </label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            min="07:00"
                            max="21:00"
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Duración (minutos)
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                        >
                            <option value={30}>30 min</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1.5 horas</option>
                            <option value={120}>2 horas</option>
                            <option value={180}>3 horas</option>
                            <option value={240}>4 horas</option>
                            <option value={360}>6 horas</option>
                            <option value={480}>8 horas</option>
                        </select>
                    </div>

                    {/* Calculated end time */}
                    {endTime && (
                        <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-surface-lighter)]">
                            <span className="text-sm text-[var(--color-text-muted)]">Hora de fin calculada: </span>
                            <span className="text-sm font-semibold text-[var(--color-accent)]">{endTime}</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                    >
                        {submitting ? 'Reservando…' : '✓ Confirmar Reserva'}
                    </button>
                </form>
            </div>
        </div>
    )
}
