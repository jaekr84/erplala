'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ModalDetalleCompra from '@/components/ModalDetalleCompra'
import { CompraConDetalles } from '@/types'
import { Button } from '@/components/ui/button'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraConDetalles[]>([])
  const [error, setError] = useState<string | null>(null)
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraConDetalles | null>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch('/api/compras')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el listado de compras')
        return res.json()
      })
      .then(data => {
        if (busqueda.trim()) {
          const filtradas = data.filter((c: CompraConDetalles) =>
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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Listado de Compras</h1>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Buscar por comprobante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm w-64"
        />
        <div className="flex gap-2">
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            ← Volver al inicio
          </Link>
          <Link
            href="/compras/nueva"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            + Crear compra
          </Link>
        </div>
      </div>

      <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
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
              <tr key={compra.id} className="border-t hover:bg-gray-50">
                <td
                  className="p-2 font-mono cursor-pointer"
                  onClick={() => setCompraSeleccionada(compra)}
                >
                  {compra.nroComprobante}
                </td>
                <td className="p-2">{new Date(compra.fecha).toLocaleDateString()}</td>
                <td className="p-2">{compra.proveedor?.nombre}</td>
                <td className="p-2">{formatCurrency(compra.total)}</td>
                <td className="p-2 space-x-2">
                  <Button asChild variant="outline">
                    <Link href={`/etiquetas?compraId=${compra.id}`}>🖨 Imprimir</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setCompraSeleccionada(compra)}>
                    Ver detalles
                  </Button>
                </td>
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