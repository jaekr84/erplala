// Nuevo código de NuevaVentaPage.tsx con mejoras en lógica de cliente, medios de pago, validaciones y UI
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { VarianteConProducto, MedioPago, Cliente } from '@/types'
import ModalCrearCliente from '@/components/ModalCrearCliente'

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

export default function NuevaVentaPage() {
    const router = useRouter()
    const [fecha, setFecha] = useState('')
    const [nroComprobante, setNroComprobante] = useState('')
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [clienteId, setClienteId] = useState(1)
    const [busqueda, setBusqueda] = useState('')
    const [codigoBarra, setCodigoBarra] = useState('')
    const [resultados, setResultados] = useState<VarianteConProducto[]>([])
    const [detalle, setDetalle] = useState<any[]>([])
    const [descuentoPorc, setDescuentoPorc] = useState(0)
    const [descuentoManual, setDescuentoManual] = useState('')
    const [medioPago1, setMedioPago1] = useState('')
    const [medioPago2, setMedioPago2] = useState('')
    const [montoPago1, setMontoPago1] = useState(0)
    const [montoPago2, setMontoPago2] = useState(0)
    const [pagoCliente, setPagoCliente] = useState(0)
    const [mediosPago, setMediosPago] = useState<MedioPago[]>([])
    const [modalCliente, setModalCliente] = useState(false)

    useEffect(() => {
        setFecha(format(new Date(), 'yyyy-MM-dd'))
        fetch('/api/contador/proximo?nombre=venta')
            .then(res => res.json())
            .then(data => setNroComprobante(data.valor))
        fetch('/api/medios-pago')
            .then(res => res.json())
            .then(data => setMediosPago(data))
        fetch('/api/clientes')
            .then(res => res.json())
            .then(data => setClientes(data))
    }, [])

    useEffect(() => {
        if (busqueda.trim().length < 2) return setResultados([])
        const delay = setTimeout(() => {
            fetch(`/api/variantes?query=${encodeURIComponent(busqueda)}`)
                .then(res => res.json())
                .then(data => setResultados(data))
        }, 300)
        return () => clearTimeout(delay)
    }, [busqueda])

    useEffect(() => {
        if (codigoBarra.trim().length < 3) return
        const delay = setTimeout(() => {
            fetch(`/api/variantes/cod-barra/${encodeURIComponent(codigoBarra)}`)
                .then(res => res.json())
                .then(data => {
                    if (data?.id) agregarAlDetalle(data)
                    setCodigoBarra('')
                })
        }, 300)
        return () => clearTimeout(delay)
    }, [codigoBarra])

    const agregarAlDetalle = (v: VarianteConProducto) => {
        setDetalle(prev => {
            const existe = prev.find(item => item.varianteId === v.id)
            if (existe) {
                return prev.map(item =>
                    item.varianteId === v.id ? { ...item, cantidad: item.cantidad + 1 } : item
                )
            }
            return [...prev, {
                varianteId: v.id,
                codigo: v.producto.codigo,
                descripcion: `${v.producto.descripcion} T:${v.talle} C:${v.color}`,
                cantidad: 1,
                precio: Number(v.producto.precioVenta) || 0
            }]
        })
    }

    const subtotal = detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    const unidades = detalle.reduce((sum, item) => sum + item.cantidad, 0)
    const descuentoCalculado = descuentoManual
        ? Number(descuentoManual)
        : Math.ceil((subtotal * (descuentoPorc / 100)) / 1000) * 1000
    const total = subtotal - descuentoCalculado
    const vuelto = pagoCliente - total

    useEffect(() => {
        // lógica de medios de pago sincronizados
        setMontoPago1(total)
        setMontoPago2(0)
        setMedioPago2('')
    }, [total])

    const handleMontoPago1Change = (valor: number) => {
        setMontoPago1(valor)
        const restante = total - valor
        if (restante > 0) {
            setMontoPago2(restante)
        } else {
            setMontoPago2(0)
            setMedioPago2('')
        }
    }

    const confirmarVenta = async () => {
        if (detalle.length === 0) return alert('Debe agregar al menos un producto')
        if (!medioPago1 && !medioPago2) return alert('Debe seleccionar al menos un medio de pago')

        const montoTotalPagado = montoPago1 + montoPago2
        if (montoTotalPagado < total) return alert('El total abonado no cubre el total de la venta')

        const payload = {
            clienteId: clienteId === 1 ? null : clienteId,
            fecha,
            detalle: detalle.map(item => ({ varianteId: item.varianteId, cantidad: item.cantidad, precio: item.precio })),
            descuento: descuentoCalculado,
            total,
            pagos: [
                ...(medioPago1 && montoPago1 ? [{ medioPagoId: Number(medioPago1), monto: montoPago1 }] : []),
                ...(medioPago2 && montoPago2 ? [{ medioPagoId: Number(medioPago2), monto: montoPago2 }] : [])
            ]
        }

        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            alert('Venta registrada')
            router.push('/')
        } else {
            const error = await res.json()
            alert('Error: ' + (error.message || 'No se pudo registrar la venta'))
        }
    }

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-4 text-sm">
            <div className="grid grid-cols-6 gap-2">
                <div>
                    <label>Fecha</label>
                    <input value={fecha} readOnly className="w-full border p-1 bg-gray-100" />
                </div>
                <div>
                    <label>Comprobante</label>
                    <input value={nroComprobante} readOnly className="w-full border p-1 bg-gray-100 font-mono" />
                </div>
                <div className="col-span-2">
                    <label>Cliente</label>
                    <select value={clienteId} onChange={e => setClienteId(Number(e.target.value))} className="w-full border p-1">
                        {clientes.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre} {c.apellido || ''}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2 flex items-end">
                    <button className="text-blue-600 text-xs" onClick={() => setModalCliente(true)}>+ Nuevo cliente</button>
                </div>
            </div>

            <div className="relative">
                <input
                    placeholder="Buscar artículo"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="border p-1 text-sm w-full"
                />
                {resultados.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border shadow max-h-48 overflow-auto">
                        {resultados.map(v => (
                            <li
                                key={v.id}
                                className="p-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                    agregarAlDetalle(v)
                                    setBusqueda('')
                                    setResultados([])
                                }}
                            >
                                {v.producto.codigo} - {v.producto.descripcion} T:{v.talle} C:{v.color} (${v.producto.precioVenta})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <input
                placeholder="Código de barras"
                value={codigoBarra}
                onChange={e => setCodigoBarra(e.target.value)}
                className="border p-1 text-sm w-full"
            />

            <div className="border h-64 overflow-y-auto">
                <table className="w-full border text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-1">Código</th>
                            <th className="p-1">Descripción</th>
                            <th className="p-1">Cantidad</th>
                            <th className="p-1">Precio</th>
                            <th className="p-1">Subtotal</th>
                            <th className="p-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalle.map((item, i) => (
                            <tr key={i} className={item.cantidad < 0 ? 'bg-yellow-100' : ''}>
                                <td className="p-1 font-mono">{item.codigo}</td>
                                <td className="p-1">{item.descripcion}</td>
                                <td className="p-1">
                                    <input
                                        type="number"
                                        value={isNaN(item.cantidad) ? 0 : item.cantidad}
                                        className="w-16 border px-1 py-0.5 text-right"
                                        onChange={(e) => {
                                            const nuevaCantidad = Number(e.target.value)
                                            setDetalle(prev => prev.map((art, j) => j === i ? { ...art, cantidad: nuevaCantidad } : art))
                                        }}
                                    />
                                </td>
                                <td className="p-1">{formatCurrency(item.precio)}</td>
                                <td className="p-1">{formatCurrency(item.precio * item.cantidad)}</td>
                                <td className="p-1 text-right">
                                    <button className="text-red-600 text-xs" onClick={() => setDetalle(prev => prev.filter((_, j) => j !== i))}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-6 gap-2">
                <div>
                    <label>Desc %</label>
                    <input type="number" value={descuentoPorc} onChange={e => setDescuentoPorc(Number(e.target.value))} className="w-full border p-1" />
                </div>
                <div>
                    <label>Desc manual</label>
                    <input type="number" value={descuentoManual} onChange={e => setDescuentoManual(e.target.value)} className="w-full border p-1" />
                </div>
                <div>
                    <label>Subtotal</label>
                    <input value={subtotal} readOnly className="w-full border p-1 bg-gray-100" />
                </div>
                <div>
                    <label>Total</label>
                    <input value={total} readOnly className="w-full border p-1 bg-gray-100 font-bold" />
                </div>
                <div>
                    <label>Unidades</label>
                    <input value={unidades} readOnly className="w-full border p-1 bg-gray-100" />
                </div>
                <div>
                    <label>Pago cliente</label>
                    <input type="number" value={pagoCliente} onChange={e => setPagoCliente(Number(e.target.value))} className="w-full border p-1" />
                </div>
                <div>
                    <label>Vuelto</label>
                    <input value={vuelto > 0 ? vuelto : 0} readOnly className="w-full border p-1 bg-gray-100" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label>Medio de pago 1</label>
                    <select value={medioPago1} onChange={e => setMedioPago1(e.target.value)} className="w-full border p-1">
                        <option value="">Seleccionar</option>
                        {mediosPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                    <input type="number" value={montoPago1} onChange={e => handleMontoPago1Change(Number(e.target.value))} className="w-full border p-1 mt-1" placeholder="Monto" />
                </div>
                <div>
                    <label>Medio de pago 2</label>
                    <select value={medioPago2} onChange={e => setMedioPago2(e.target.value)} disabled={!montoPago2} className="w-full border p-1">
                        <option value="">Seleccionar</option>
                        {mediosPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                    <input type="number" value={montoPago2} readOnly className="w-full border p-1 mt-1 bg-gray-100" placeholder="Monto" />
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-400 text-white rounded">
                    Cancelar
                </button>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => alert('Ticket de cambio')}>Ticket de cambio</button>
                    <button onClick={confirmarVenta} className="px-6 py-2 bg-green-600 text-white rounded">
                        Generar venta
                    </button>
                </div>
            </div>
            <ModalCrearCliente
                isOpen={modalCliente}
                onClose={() => setModalCliente(false)}
                onCreated={async () => {
                    const res = await fetch('/api/clientes')
                    const data = await res.json()
                    setClientes(data)
                    setClienteId(data.at(-1).id) // selecciona automáticamente el nuevo
                }}
            />
        </div>
    )
}