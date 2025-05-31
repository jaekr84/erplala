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
  const [dropdownVisible, setDropdownVisible] = useState(false)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-area')) {
        setDropdownVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buscar = async () => {
    if (!busqueda.trim()) return
    try {
      const res = await fetch(`/api/variantes/buscar?query=${encodeURIComponent(busqueda)}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setVariantesEncontradas(data.map((v: VarianteEtiqueta) => ({ ...v, cantidad: 1 })))
        setDropdownVisible(true)
      } else {
        setMensaje('❌ Respuesta inesperada del servidor')
      }
    } catch (error) {
      console.error('Error al buscar variantes:', error)
      setMensaje('❌ Error al buscar variantes')
    }
  }

  const agregar = (v: VarianteEtiqueta) => {
    const existing = seleccionadas.find(sel => sel.id === v.id)
    if (existing) {
      setSeleccionadas(sel =>
        sel.map(item => item.id === v.id ? { ...item, cantidad: item.cantidad + v.cantidad } : item)
      )
    } else {
      setSeleccionadas([...seleccionadas, v])
    }
    setMensaje(null)
    setBusqueda('')
  }

  const agregarTodas = () => {
    setSeleccionadas(sel => {
      const actualizado = [...sel]
      for (const v of variantesEncontradas) {
        const existente = actualizado.find(item => item.id === v.id)
        if (existente) {
          existente.cantidad += v.cantidad
        } else {
          actualizado.push({ ...v })
        }
      }
      return actualizado
    })
    setBusqueda('')
  }

  const actualizarCantidad = (id: number, cantidad: number) => {
    setSeleccionadas(sel =>
      sel.map(v => (v.id === id ? { ...v, cantidad: Math.max(1, cantidad) } : v))
    )
  }

  const eliminar = (id: number) => {
    setSeleccionadas(sel => sel.filter(v => v.id !== id))
  }

  const vaciarLista = () => {
    setSeleccionadas([])
    setMensaje(null)
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

      <div className="mb-4">
        <div className="relative dropdown-area">
          <div className="flex gap-2">
            <Input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar artículo o código de barra..."
              onFocus={() => setDropdownVisible(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && variantesEncontradas.length > 0) {
                  agregar(variantesEncontradas[0])
                  e.preventDefault()
                }
              }}
            />
            <Button onClick={buscar}>Buscar</Button>
          </div>
          {dropdownVisible && variantesEncontradas.length > 0 && (
            <ul className="absolute z-10 top-full left-0 w-full mt-2 border border-gray-300 rounded shadow max-h-64 overflow-auto bg-white">
              <li className="p-2 bg-gray-100 text-sm text-blue-600 cursor-pointer hover:underline" onClick={agregarTodas}>
                + Agregar todas las variantes
              </li>
              {variantesEncontradas.map(v => (
                <li
                  key={v.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    agregar(v)
                  }}
                >
                  <span>{v.producto.codigo} - {v.producto.descripcion} | {v.talle} | {v.color}</span>
                  <Button size="sm">Agregar</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">Variantes seleccionadas:</h2>
        {seleccionadas.length === 0 ? (
          <p className="text-gray-600">No hay artículos seleccionados.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="p-2 text-left">Código</th>
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
                  <td className="p-2">{v.producto.codigo}</td>
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
        )}

        <div className="text-right mt-4 space-x-2">
          <Button onClick={generarPDF} disabled={seleccionadas.length === 0}>Generar PDF</Button>
          <Button variant="destructive" onClick={vaciarLista} disabled={seleccionadas.length === 0}>Vaciar lista</Button>
        </div>

        {mensaje && <p className="mt-2 text-sm text-gray-600">{mensaje}</p>}
      </div>
    </div>
  )
}