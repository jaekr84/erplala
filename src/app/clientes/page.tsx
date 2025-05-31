'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cliente } from '@/types'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const clientesFiltrados = clientes.filter(c => {
    const texto = `${c.nombre} ${c.apellido} ${c.dni || ''}`.toLowerCase()
    return texto.includes(busqueda.trim().toLowerCase())
  })

  const porPagina = 25
  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / porPagina))
  const clientesPagina = clientesFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => {
        console.error(err)
        setError('Error al cargar clientes')
      })
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/clientes/nuevo">+ Nuevo</Link>
          </Button>
        </div>
      </div>

      <Input
        placeholder="Buscar por nombre o DNI"
        value={busqueda}
        onChange={(e) => {
          setPagina(1)
          setBusqueda(e.target.value)
        }}
        className="max-w-md"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">DNI</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesPagina.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              clientesPagina.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/50">
                  <td className="p-3">{c.nombre} {c.apellido}</td>
                  <td className="p-3">{c.dni || '—'}</td>
                  <td className="p-3">{c.telefono || '—'}</td>
                  <td className="p-3">{c.email || '—'}</td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setClienteSeleccionado(c)
                        setModalAbierto(true)
                      }}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
        >
          ← Anterior
        </Button>
        <span className="text-sm text-muted-foreground">Página {pagina} de {totalPaginas}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
        >
          Siguiente →
        </Button>
      </div>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          {clienteSeleccionado && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <Input
                  value={clienteSeleccionado.nombre}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Apellido</label>
                <Input
                  value={clienteSeleccionado.apellido}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, apellido: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">DNI</label>
                <Input
                  value={clienteSeleccionado.dni || ''}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, dni: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <Input
                  value={clienteSeleccionado.telefono || ''}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, telefono: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={clienteSeleccionado.email || ''}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <Input
                  type="date"
                  value={clienteSeleccionado.fechaNac || ''}
                  onChange={(e) =>
                    setClienteSeleccionado({ ...clienteSeleccionado, fechaNac: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!clienteSeleccionado) return;
                const clienteFormateado = {
                  ...clienteSeleccionado,
                  fechaNac: clienteSeleccionado.fechaNac
                    ? new Date(clienteSeleccionado.fechaNac).toISOString().slice(0, 10)
                    : ''
                }
                const res = await fetch(`/api/clientes/${clienteSeleccionado.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(clienteFormateado),
                })
                if (res.ok) {
                  setClientes((prev) =>
                    prev.map(c => c.id === clienteSeleccionado.id ? clienteSeleccionado : c)
                  )
                  setModalAbierto(false)
                }
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}