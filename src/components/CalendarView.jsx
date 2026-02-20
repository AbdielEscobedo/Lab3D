import { useState, useEffect, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import BookingModal from './BookingModal'

const STATUS_COLORS = {
    confirmada: '#10b981',
    pendiente: '#f59e0b',
    completada: '#475569',
}

export default function CalendarView() {
    const { user } = useAuth()
    const [machines, setMachines] = useState([])
    const [events, setEvents] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedInfo, setSelectedInfo] = useState(null)

    const fetchMachines = useCallback(async () => {
        const { data } = await supabase.from('maquinas').select('*').order('orden')
        if (data) setMachines(data)
    }, [])

    const fetchReservations = useCallback(async () => {
        const { data } = await supabase
            .from('reservas')
            .select('*, perfiles(nombre_completo), maquinas(nombre)')
        if (data) {
            setEvents(
                data.map((r) => ({
                    id: r.id,
                    resourceId: r.maquina_id,
                    title: `${r.perfiles?.nombre_completo || 'Alumno'} — ${r.status}`,
                    start: r.inicio,
                    end: r.fin,
                    backgroundColor: STATUS_COLORS[r.status] || STATUS_COLORS.pendiente,
                    borderColor: 'transparent',
                    classNames: [`event-${r.status}`],
                    extendedProps: { status: r.status, alumno_id: r.alumno_id },
                }))
            )
        }
    }, [])

    useEffect(() => {
        fetchMachines()
        fetchReservations()
    }, [fetchMachines, fetchReservations])

    const resources = machines.map((m) => ({
        id: m.id,
        title: m.nombre,
        estado: m.estado,
    }))

    const handleDateSelect = (selectInfo) => {
        if (!user) return
        setSelectedInfo({
            machineId: selectInfo.resource?.id || '',
            start: selectInfo.startStr,
            end: selectInfo.endStr,
        })
        setModalOpen(true)
    }

    const handleEventClick = async (clickInfo) => {
        const ev = clickInfo.event
        if (ev.extendedProps.alumno_id === user?.id) {
            if (window.confirm('¿Deseas cancelar esta reserva?')) {
                await supabase.from('reservas').delete().eq('id', ev.id)
                fetchReservations()
            }
        }
    }

    const handleBooked = () => {
        setModalOpen(false)
        setSelectedInfo(null)
        fetchReservations()
    }

    return (
        <div className="flex-1 p-4 md:p-6">
            <div className="bg-[var(--color-surface-light)] rounded-2xl p-4 md:p-6 border border-[var(--color-surface-lighter)] shadow-xl">
                <FullCalendar
                    plugins={[resourceTimeGridPlugin, interactionPlugin]}
                    initialView="resourceTimeGridDay"
                    resources={resources}
                    events={events}
                    selectable={!!user}
                    selectMirror
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    nowIndicator
                    height="auto"
                    locale="es"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: '',
                    }}
                    slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short',
                    }}
                    resourceLabelContent={(arg) => (
                        <div className="text-center">
                            <div className="font-semibold text-sm">{arg.resource.title}</div>
                            <div
                                className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${arg.resource.extendedProps.estado === 'disponible'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : arg.resource.extendedProps.estado === 'mantenimiento'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}
                            >
                                {arg.resource.extendedProps.estado}
                            </div>
                        </div>
                    )}
                />
            </div>

            {modalOpen && (
                <BookingModal
                    machines={machines}
                    selectedInfo={selectedInfo}
                    onClose={() => {
                        setModalOpen(false)
                        setSelectedInfo(null)
                    }}
                    onBooked={handleBooked}
                />
            )}
        </div>
    )
}
