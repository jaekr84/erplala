// src/app/compras/nueva/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ModalVariantes from '@/components/ModalVariantes'
import { Proveedor, Articulo, VarianteCompra } from '@/types'
import { formatCurrency } from '@/utils/format'
import ModalCrearArticulo from '@/components/ModalCrearArticulo'
import ModalProveedor from '@/components/ModalProveedor'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



export default function NuevaCompraPage() {
  const [fecha, setFecha] = useState('')
  const [nroComprobante, setNroComprobante] = useState('')
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [proveedorBusqueda, setProveedorBusqueda] = useState('')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedorModal, setProveedorModal] = useState(false)

  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null)
  const [modalVariantes, setModalVariantes] = useState(false)
  const [variantesCompra, setVariantesCompra] = useState<VarianteCompra[]>([])

  const [descuento, setDescuento] = useState(0)
  const [totalCantidades, setTotalCantidades] = useState(0)
  const [totalBruto, setTotalBruto] = useState(0)
  const [totalNeto, setTotalNeto] = useState(0)
  const [modalCrearArticulo, setModalCrearArticulo] = useState(false)

  useEffect(() => {
    setFecha(new Date().toISOString().split('T')[0]) // Formato YYYY-MM-DD

    fetch('/api/contador/proximo?nombre=compra')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error('Error al obtener contador: ' + text)
        }
        return res.json()
      })
      .then(data => setNroComprobante(data.valor))
      .catch(err => {
        console.error('❌ Error al cargar contador:', err)
        alert('No se pudo cargar el número de comprobante. Revisá consola.')
      })
  }, [])

  useEffect(() => {
    fetch('/api/proveedores?query=' + proveedorBusqueda)
      .then(res => res.json())
      .then(data => setProveedores(data))
  }, [proveedorBusqueda])

  useEffect(() => {
    if (articuloBusqueda.length < 2) return
    fetch('/api/articulos?query=' + articuloBusqueda)
      .then(res => res.json())
      .then(data => setArticulos(data.articulos))
  }, [articuloBusqueda])

  useEffect(() => {
    let totalCant = 0
    let total = 0
    for (const v of variantesCompra) {
      totalCant += Number(v.cantidad)
      total += Number(v.cantidad) * Number(v.costo)
    }
    setTotalCantidades(totalCant)
    setTotalBruto(total)
    setTotalNeto(total * (1 - descuento / 100))
  }, [variantesCompra, descuento])

  const handleAgregarVariantes = (variantesSeleccionadas: VarianteCompra[]) => {
    setVariantesCompra(prev => [
      ...prev,
      ...variantesSeleccionadas.filter(v => !prev.some(vc => vc.id === v.id))
    ])
    setModalVariantes(false)
    setArticuloSeleccionado(null)
    setArticuloBusqueda('')
  }

  const handleQuitarVariante = (id: number) => {
    setVariantesCompra(prev => prev.filter(v => v.id !== id))
  }

  const handleConfirmar = async () => {
    if (!proveedor || variantesCompra.length === 0) {
      alert('Selecciona un proveedor y al menos una variante')
      return
    }
    const res = await fetch('/api/compras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nroComprobante, // 🔹 ahora se incluye aquí
        proveedorId: proveedor.id,
        descuento,
        variantes: variantesCompra.map(v => ({
          id: v.id,
          cantidad: Number(v.cantidad),
          costo: Number(v.costo)
        }))
      })
    })
    if (res.ok) {
      alert('Compra registrada correctamente')
      window.location.href = '/compras'
    } else {
      alert('Error al registrar la compra')
    }
  }



  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nueva Compra</h1>

      {/* Fecha y Comprobante */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Fecha</label>
          <Input value={fecha} disabled className="bg-muted" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Comprobante</label>
          <Input value={nroComprobante} disabled className="bg-muted" />
        </div>
      </div>

      {/* Proveedor */}
      <div>
        <label className="text-sm mb-1 text-muted-foreground block">Proveedor</label>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar proveedor"
            value={proveedorBusqueda}
            onChange={e => setProveedorBusqueda(e.target.value)}
            disabled={!!proveedor}
          />
          <Button onClick={() => setProveedorModal(true)}>+ Nuevo</Button>
          {proveedor && (
            <Button variant="secondary" onClick={() => setProveedor(null)}>Cambiar</Button>
          )}
        </div>
        {proveedorBusqueda.length > 1 && !proveedor && (
          <ul className="border mt-1 max-h-32 overflow-auto bg-white text-sm">
            {proveedores.map(p => (
              <li
                key={p.id}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => setProveedor(p)}
              >
                {p.nombre}
              </li>
            ))}
          </ul>
        )}
        {proveedor && (
          <div className="mt-1 text-green-700 font-semibold">{proveedor.nombre}</div>
        )}
      </div>

      {/* Artículos */}
      <div>
        <label className="text-sm block text-muted-foreground">Buscar artículo</label>
        <div className="flex gap-2">
          <Input
            placeholder="Código o descripción"
            value={articuloBusqueda}
            onChange={e => setArticuloBusqueda(e.target.value)}
          />
          <Button variant="default" onClick={() => setModalVariantes(true)} disabled={!articulos.length}>Agregar</Button>
          <Button variant="default" onClick={() => setModalCrearArticulo(true)}>Crear artículo</Button>
        </div>
        {articulos.length > 0 && (
          <ul className="border mt-1 max-h-32 overflow-auto bg-white text-sm">
            {articulos.map(a => (
              <li
                key={a.id}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  setArticuloSeleccionado(a)
                  setModalVariantes(true)
                }}
              >
                {a.codigo} - {a.descripcion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Variantes */}
      {modalVariantes && articuloSeleccionado && (
        <ModalVariantes
          articulo={articuloSeleccionado}
          onClose={() => setModalVariantes(false)}
          onAgregar={handleAgregarVariantes}
        />
      )}

      {/* Lista variantes agregadas */}
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="p-2">Código</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Talle</th>
            <th className="p-2">Color</th>
            <th className="p-2">Costo</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2">Cod. Barra</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {variantesCompra.map((v, i) => (
            <tr key={v.id}>
              <td className="p-2">{v.codigo}</td>
              <td className="p-2">{v.codBarra}</td>
              <td className="p-2">{v.descripcion}</td>
              <td className="p-2">{v.talle}</td>
              <td className="p-2">
                <Input
                  type="number"
                  value={v.costo}
                  onChange={e => {
                    const costo = Number(e.target.value)
                    setVariantesCompra(prev => prev.map((variante, idx) => idx === i ? { ...variante, costo } : variante))
                  }}
                  className="w-24"
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  value={v.cantidad}
                  onChange={e => {
                    const cantidad = Number(e.target.value)
                    setVariantesCompra(prev => prev.map((variante, idx) => idx === i ? { ...variante, cantidad } : variante))
                  }}
                  className="w-16"
                />
              </td>
              <td className="p-2">{formatCurrency(v.cantidad * v.costo)}</td>
              <td className="p-2">{v.codBarra}</td>
              <td className="p-2">
                <Button variant="link" size="sm" className="text-red-600" onClick={() => handleQuitarVariante(v.id)}>
                  Quitar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm block text-muted-foreground">Descuento (%)</label>
          <Input
            type="number"
            value={descuento}
            onChange={e => setDescuento(Number(e.target.value))}
            min={0}
            max={100}
            className="w-24"
          />
        </div>
        <div className="ml-auto text-right space-y-1">
          <div>Total cantidades: <strong>{totalCantidades}</strong></div>
          <div>Total bruto: <strong>{formatCurrency(totalBruto)}</strong></div>
          <div>Total neto: <strong>{formatCurrency(totalNeto)}</strong></div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Link href="/">
          <Button variant="outline">← Volver al inicio</Button>
        </Link>
        <Button variant="default" className="bg-black hover:bg-gray-800 text-white">
          Confirmar compra
        </Button>
      </div>

      {modalCrearArticulo && (
        <ModalCrearArticulo
          onClose={() => setModalCrearArticulo(false)}
          onArticuloCreado={() => {
            setArticuloBusqueda('')
          }}
        />
      )}

      {proveedorModal && (
        <ModalProveedor
          isOpen={proveedorModal}
          onClose={() => setProveedorModal(false)}
          onCreated={async () => {
            const res = await fetch('/api/proveedores')
            const data = await res.json()
            setProveedores(data)
          }}
        />
      )}
    </div>
  )
}