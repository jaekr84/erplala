// src/app/compras/nueva/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ModalVariantes from '@/components/ModalVariantes'
import { Proveedor, Articulo, VarianteCompra } from '@/types'
import { formatCurrency } from '@/utils/format'
import ModalCrearArticulo from '@/components/ModalCrearArticulo'
import FormArticulo from '@/components/FormArticulo'
import ModalProveedor from '@/components/ModalProveedor'


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
    setFecha(new Date().toISOString())

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva Compra</h1>

      {/* Fecha y Comprobante */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Fecha</label>
          <input className="border p-2 bg-gray-100" value={fecha} disabled />
        </div>
        <div>
          <label className="block text-sm">Comprobante</label>
          <input className="border p-2 bg-gray-100" value={nroComprobante} disabled />
        </div>
      </div>

      {/* Proveedor */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Proveedor</label>
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            placeholder="Buscar proveedor"
            value={proveedorBusqueda}
            onChange={e => setProveedorBusqueda(e.target.value)}
            disabled={!!proveedor}
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setProveedorModal(true)}
          >
            + Nuevo
          </button>
          {proveedor && (
            <button
              type="button"
              className="bg-gray-400 text-white px-3 py-1 rounded"
              onClick={() => setProveedor(null)}
            >
              Cambiar
            </button>
          )}
        </div>
        {proveedorBusqueda.length > 1 && !proveedor && (
          <ul className="border mt-1 max-h-32 overflow-auto bg-white">
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
      <div className="mb-4">
        <label className="block text-sm">Buscar artículo</label>
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            placeholder="Código o descripción"
            value={articuloBusqueda}
            onChange={e => setArticuloBusqueda(e.target.value)}
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setModalVariantes(true)}
            disabled={!articulos.length}
          >
            Agregar
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setModalCrearArticulo(true)}
          >
            Crear artículo
          </button>
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
        {articulos.length > 0 && (
          <ul className="border mt-1 max-h-32 overflow-auto bg-white">
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

      {modalVariantes && articuloSeleccionado && (
        <ModalVariantes
          articulo={articuloSeleccionado}
          onClose={() => setModalVariantes(false)}
          onAgregar={handleAgregarVariantes}
        />
      )}


      {/* Modal Variantes */}
      {modalVariantes && articuloSeleccionado && (
        <ModalVariantes
          articulo={articuloSeleccionado}
          onClose={() => setModalVariantes(false)}
          onAgregar={handleAgregarVariantes}
        />
      )}

      {/* Lista variantes agregadas */}
      <table className="w-full border text-sm mt-6">
        <thead>
          <tr className="bg-gray-100">
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
              <td className="p-2">{v.color}</td>
              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-20"
                  value={v.costo}
                  onChange={e => {
                    const costo = Number(e.target.value)
                    setVariantesCompra(prev =>
                      prev.map((variante, idx) =>
                        idx === i ? { ...variante, costo } : variante
                      )
                    )
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-16"
                  value={v.cantidad}
                  onChange={e => {
                    const cantidad = Number(e.target.value)
                    setVariantesCompra(prev =>
                      prev.map((variante, idx) =>
                        idx === i ? { ...variante, cantidad } : variante
                      )
                    )
                  }}
                />
              </td>
              <td className="p-2">{formatCurrency(v.cantidad * v.costo)}</td>
              <td className="p-2">
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => handleQuitarVariante(v.id)}
                >
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex gap-4 mt-6 items-end">
        <div>
          <label className="block text-sm">Descuento (%)</label>
          <input
            type="number"
            className="border p-2 w-24"
            value={descuento}
            onChange={e => setDescuento(Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div className="ml-auto text-right">
          <div>Total cantidades: <strong>{totalCantidades}</strong></div>
          <div>Total bruto: <strong>{formatCurrency(totalBruto)}</strong></div>
          <div>Total neto: <strong>{formatCurrency(totalNeto)}</strong></div>
        </div>
      </div>

      <button
        className="mt-8 bg-green-600 text-white px-6 py-2 rounded"
        onClick={handleConfirmar}
      >
        Confirmar compra
      </button>
      {modalCrearArticulo && (
        <ModalCrearArticulo
          onClose={() => setModalCrearArticulo(false)}
          onArticuloCreado={() => {
            // recargar lista de artículos
            setArticuloBusqueda('') // o trigger reload si tenés función específica
          }}
        />
      )}

    </div>
  )
}