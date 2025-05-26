'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DatosNegocio {
  nombre: string
  direccion: string
  telefono: string
  cuit: string
  pieTicket: string
}

export default function DatosNegocioPage() {
  const [datos, setDatos] = useState<DatosNegocio>({
    nombre: '',
    direccion: '',
    telefono: '',
    cuit: '',
    pieTicket: '',
  })
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/datosNegocio')
      .then(res => res.json())
      .then(data => {
        if (!data?.error) setDatos(data)
      })
  }, [])

  const guardar = async () => {
    const res = await fetch('/api/datosNegocio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (res.ok) setMensaje('✅ Cambios guardados')
    else setMensaje('❌ Error al guardar')
  }

  const actualizar = (campo: keyof DatosNegocio, valor: string) => {
    setDatos({ ...datos, [campo]: valor })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🧾 Datos del Negocio</h1>

      <div className="space-y-4">
        <Input value={datos.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Nombre del negocio" />
        <Input value={datos.direccion} onChange={e => actualizar('direccion', e.target.value)} placeholder="Dirección" />
        <Input value={datos.telefono} onChange={e => actualizar('telefono', e.target.value)} placeholder="Teléfono / WhatsApp" />
        <Input value={datos.cuit} onChange={e => actualizar('cuit', e.target.value)} placeholder="CUIT / Condición fiscal" />
        <textarea
          value={datos.pieTicket}
          onChange={e => actualizar('pieTicket', e.target.value)}
          placeholder="Texto de pie de ticket (ej. políticas de cambio)"
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={guardar}>💾 Guardar cambios</Button>
        {mensaje && <span className="text-sm text-gray-600">{mensaje}</span>}
      </div>
    </div>
  )
}