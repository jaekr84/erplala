'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


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
  <div className="p-8 max-w-6xl mx-auto space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-800">Listado de Artículos</h1>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/articulos/nuevo">+ Nuevo artículo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">← Volver al inicio</Link>
        </Button>
      </div>
    </div>

    <Input
      placeholder="Buscar por código o descripción..."
      value={busqueda}
      onChange={(e) => {
        setPagina(1)
        setBusqueda(e.target.value)
      }}
    />

    {articulos.length === 0 ? (
      <p className="text-gray-500">No hay artículos cargados.</p>
    ) : (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
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
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => setDetalle(a)}
              >
                <td className="p-3">{a.codigo}</td>
                <td className="p-3">{a.descripcion}</td>
                <td className="p-3">${a.precioVenta}</td>
                <td className="p-3">{a.proveedor?.nombre || '—'}</td>
                <td className="p-3">
                  <Button asChild size="sm" variant="default" className="text-white" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/articulos/editar/${a.id}`}>Editar</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div className="flex justify-center items-center gap-4">
      <Button
        variant="default"
        size="sm"
        disabled={pagina <= 1}
        onClick={() => setPagina((p) => p - 1)}
      >
        ← Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variant="default"
        size="sm"
        disabled={pagina >= totalPaginas}
        onClick={() => setPagina((p) => p + 1)}
      >
        Siguiente →
      </Button>
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