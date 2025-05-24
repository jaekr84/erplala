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
      const res = await fetch(`/api/articulos?query=${busqueda}&pagina=${pagina}`)
      const data = await res.json()
      setArticulos(data.articulos)
      setTotalPaginas(data.totalPaginas)
    }
    fetchArticulos()
  }, [busqueda, pagina])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listado de Artículos</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            ← Volver al inicio
          </button>
        </Link>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          className="border p-2 w-full"
          value={busqueda}
          onChange={(e) => {
            setPagina(1)
            setBusqueda(e.target.value)
          }}
        />
      </div>

      {articulos.length === 0 ? (
        <p>No hay artículos cargados.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Precio</th>
              <th className="p-2 text-left">Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => (
              <tr
                key={a.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => setDetalle(a)}
              >
                <td className="p-2">{a.codigo}</td>
                <td className="p-2">{a.descripcion}</td>
                <td className="p-2">${a.precioVenta}</td>
                <td className="p-2">{a.proveedor?.nombre || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={pagina <= 1}
          onClick={() => setPagina(p => p - 1)}
        >
          ← Anterior
        </button>
        <span className="self-center">Página {pagina} de {totalPaginas}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina(p => p + 1)}
        >
          Siguiente →
        </button>
      </div>

      {detalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-sm text-gray-500"
              onClick={() => setDetalle(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2">{detalle.descripcion}</h2>
            <p className="text-sm text-gray-600 mb-1">
              Código: <strong>{detalle.codigo}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Precio: ${detalle.precioVenta}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Proveedor: {detalle.proveedor?.nombre || '—'}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Fecha: {new Date(detalle.createdAt).toLocaleDateString()}
            </p>
            {detalle.variantes.length > 0 && (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Talle</th>
                    <th className="p-2">Color</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Cod. Barra</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.variantes.map(v => (
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
