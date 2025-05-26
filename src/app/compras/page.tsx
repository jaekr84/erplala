'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import ModalDetalleCompra from '@/components/ModalDetalleCompra'

// Tipos
type Variante = {
  codBarra: string
  producto: {
    descripcion: string
  }
  talle: string
  color: string
}

type DetalleCompra = {
  id: number
  variante: Variante
  cantidad: number
  costo: number
}

type Compra = {
  id: number
  fecha: string
  proveedor: {
    nombre: string
  }
  total: number
  detalles: DetalleCompra[]
  nroComprobante: string
}

// Formato de moneda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [error, setError] = useState<string | null>(null)
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch('/api/compras')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el listado de compras')
        return res.json()
      })
      .then(data => {
        if (busqueda.trim()) {
          const filtradas = data.filter((c: Compra) =>
            c.nroComprobante.toLowerCase().includes(busqueda.trim().toLowerCase())
          )
          setCompras(filtradas)
        } else {
          setCompras(data)
        }
      })
      .catch(err => setError(err.message))
  }, [busqueda])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Listado de Compras</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Controles */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por comprobante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
        <div className="flex gap-2">
          <Link href="/">
            <button className="bg-gray-400 text-white px-3 py-1 rounded">
              ← Volver al inicio
            </button>
          </Link>
          <Link href="/compras/nueva">
            <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
              + Crear compra
            </button>
          </Link>
        </div>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Comprobante</th>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Proveedor</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compras.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No hay compras registradas.
              </td>
            </tr>
          ) : (
            compras.map(compra => (
              <tr
                key={compra.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => setCompraSeleccionada(compra)}
              >
                <td className="p-2 font-mono">{compra.nroComprobante}</td>
                <td className="p-2">{new Date(compra.fecha).toLocaleDateString()}</td>
                <td className="p-2">{compra.proveedor?.nombre}</td>
                <td className="p-2">{formatCurrency(compra.total)}</td>
                <td className="p-2 text-blue-600">Ver detalles</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {compraSeleccionada && (
        <ModalDetalleCompra
          compra={compraSeleccionada}
          onClose={() => setCompraSeleccionada(null)}
        />
      )}
    </div>
  )
}