'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Variante, Producto } from '@prisma/client'

export type VarianteEtiqueta = Variante & {
  cantidad: number
  producto: Pick<Producto, 'codigo' | 'descripcion'>
  codBarra: string
}

export default function EtiquetasPage() {
  const [busqueda, setBusqueda] = useState('')
  const [variantesEncontradas, setVariantesEncontradas] = useState<VarianteEtiqueta[]>([])
  const [seleccionadas, setSeleccionadas] = useState<VarianteEtiqueta[]>([])
  const [mensaje, setMensaje] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const compraId = searchParams.get('compraId')
    if (compraId) {
      fetch(`/api/etiquetas/compra?compraId=${compraId}`)
        .then(res => res.json())
        .then(setSeleccionadas)
        .catch(() => setMensaje('❌ Error al cargar etiquetas de la compra'))
    }
  }, [searchParams])

  const buscar = async () => {
    if (!busqueda.trim()) return
    const res = await fetch(`/api/variantes/buscar?query=${busqueda}`)
    const data = await res.json()
    setVariantesEncontradas(data.map((v: VarianteEtiqueta) => ({ ...v, cantidad: 1 })))
  }

  const agregar = (v: VarianteEtiqueta) => {
    if (seleccionadas.find(sel => sel.id === v.id)) return
    setSeleccionadas([...seleccionadas, v])
  }

  const actualizarCantidad = (id: number, cantidad: number) => {
    setSeleccionadas(sel =>
      sel.map(v => (v.id === id ? { ...v, cantidad: Math.max(1, cantidad) } : v))
    )
  }

  const eliminar = (id: number) => {
    setSeleccionadas(sel => sel.filter(v => v.id !== id))
  }

  const generarPDF = async () => {
    const res = await fetch('/api/etiquetas/generar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seleccionadas),
    })

    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setMensaje('✅ PDF generado correctamente')
      setSeleccionadas([])
      setVariantesEncontradas([])
      setBusqueda('')
    } else {
      setMensaje('❌ Error al generar el PDF')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4"> Generar Etiquetas</h1>

      <div className="flex gap-2">
        <Input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar artículo o código de barra..."
        />
        <Button onClick={buscar}>Buscar</Button>
      </div>

      {variantesEncontradas.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Resultados:</h2>
          <ul className="space-y-1">
            {variantesEncontradas.map(v => (
              <li
                key={v.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>
                  {v.producto.descripcion} | {v.talle} | {v.color}
                </span>
                <Button onClick={() => agregar(v)}>Agregar</Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {seleccionadas.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Variantes seleccionadas:</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Talle</th>
                <th className="p-2 text-left">Color</th>
                <th className="p-2 text-left">Cantidad</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {seleccionadas.map(v => (
                <tr key={v.id} className="border-t">
                  <td className="p-2">{v.producto.descripcion}</td>
                  <td className="p-2">{v.talle}</td>
                  <td className="p-2">{v.color}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={v.cantidad}
                      onChange={e => actualizarCantidad(v.id, parseInt(e.target.value))}
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Button variant="destructive" onClick={() => eliminar(v.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mt-4 space-x-2">
            <Button onClick={generarPDF}>Generar PDF</Button>
          </div>

          {mensaje && <p className="mt-2 text-sm text-gray-600">{mensaje}</p>}
        </div>
      )}
    </div>
  )
}