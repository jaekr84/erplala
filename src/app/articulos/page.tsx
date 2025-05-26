'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Articulo = {
  id: number
  codigo: string
  descripcion: string
  precioVenta: number
  proveedor: { nombre: string } | null
  categoria?: { nombre: string }
  createdAt: string
  variantes: {
    id: number
    talle: string
    color: string
    stock: number
    codBarra: string
  }[]
}

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState<Articulo | null>(null)
  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const res = await fetch(`/api/articulos?query=${encodeURIComponent(busqueda)}&pagina=${pagina}`)
        if (!res.ok) throw new Error('No se pudo cargar la lista de artículos.')
        const data = await res.json()
        setArticulos(data.articulos)
        setTotalPaginas(data.totalPaginas)
      } catch (error) {
        console.error('Error:', error)
        setArticulos([])
        setTotalPaginas(1)
      }
    }

    fetchArticulos()
  }, [busqueda, pagina])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Listado de Artículos</h1>
        <div className="flex gap-2">
          <Link href="/articulos/nuevo" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
            + Nuevo artículo
          </Link>
          <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={busqueda}
          onChange={(e) => {
            setPagina(1)
            setBusqueda(e.target.value)
          }}
        />
      </div>

      {articulos.length === 0 ? (
        <p className="text-gray-500">No hay artículos cargados.</p>
      ) : (
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Descripción</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-left p-3">Proveedor</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => (
              <tr
                key={a.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setDetalle(a)}
              >
                <td className="p-3">{a.codigo}</td>
                <td className="p-3">{a.descripcion}</td>
                <td className="p-3">${a.precioVenta}</td>
                <td className="p-3">{a.proveedor?.nombre || '—'}</td>
                <td className="p-3">
                  <Link href={`/articulos/editar/${a.id}`}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-8 flex justify-center items-center gap-4">
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          disabled={pagina <= 1}
          onClick={() => setPagina((p) => p - 1)}
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-700">Página {pagina} de {totalPaginas}</span>
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente →
        </button>
      </div>

      {detalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative overflow-auto shadow-lg" style={{ maxHeight: '90vh' }}>
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none"
              title="Cerrar"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-2">{detalle.descripcion}</h2>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p><strong>Código:</strong> {detalle.codigo}</p>
              <p><strong>Precio:</strong> ${detalle.precioVenta}</p>
              <p><strong>Proveedor:</strong> {detalle.proveedor?.nombre || '—'}</p>
              <p><strong>Fecha de alta:</strong> {new Date(detalle.createdAt).toLocaleDateString()}</p>
            </div>

            {detalle.variantes.length > 0 && (
              <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Talle</th>
                    <th className="p-2">Color</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Cod. Barra</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.variantes.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="p-2">{v.talle}</td>
                      <td className="p-2">{v.color}</td>
                      <td className="p-2">{v.stock}</td>
                      <td className="p-2">{v.codBarra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}