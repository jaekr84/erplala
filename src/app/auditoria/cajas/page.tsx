'use client'

import { useEffect, useState } from 'react'

export default function AuditoriaCajaPage() {
  const [auditoria, setAuditoria] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    usuarioId: '',
    accion: ''
  })

  useEffect(() => {
    fetch('/api/usuarios')
      .then(res => res.json())
      .then(setUsuarios)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(filtros as any)
    fetch('/api/auditoria-caja?' + params.toString())
      .then(res => res.json())
      .then(setAuditoria)
  }, [filtros])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📋 Auditoría de Caja</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-sm">Desde</label>
          <input
            type="date"
            className="w-full border rounded p-1"
            value={filtros.desde}
            onChange={e => setFiltros(prev => ({ ...prev, desde: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm">Hasta</label>
          <input
            type="date"
            className="w-full border rounded p-1"
            value={filtros.hasta}
            onChange={e => setFiltros(prev => ({ ...prev, hasta: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm">Usuario</label>
          <select
            className="w-full border rounded p-1"
            value={filtros.usuarioId}
            onChange={e => setFiltros(prev => ({ ...prev, usuarioId: e.target.value }))}
          >
            <option value="">Todos</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">Acción</label>
          <select
            className="w-full border rounded p-1"
            value={filtros.accion}
            onChange={e => setFiltros(prev => ({ ...prev, accion: e.target.value }))}
          >
            <option value="">Todas</option>
            <option value="apertura">Apertura</option>
            <option value="cierre">Cierre</option>
            <option value="reapertura">Reapertura</option>
          </select>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-gray-800">
        {auditoria.length === 0 && <p className="text-gray-500">No hay registros.</p>}
        {auditoria.map((a, i) => (
          <li key={i} className="border-b pb-2">
            <strong>{a.usuario.nombre}</strong> hizo <strong>{a.accion}</strong> 
            {' '}el {new Date(a.fecha).toLocaleString('es-AR')} 
            {' '}en caja #{a.cajaId} — {a.detalle}
          </li>
        ))}
      </ul>
    </div>
  )
}