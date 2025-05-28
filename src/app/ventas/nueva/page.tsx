// NuevaVentaPage.tsx corregido y ordenado
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { VarianteConProducto, MedioPago, Cliente } from '@/types'
import ModalCrearCliente from '@/components/ModalCrearCliente'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
    const [cargando, setCargando] = useState(true)
    const [cajaActiva, setCajaActiva] = useState(false)

    useEffect(() => {
        fetch('/api/caja/estado')
            .then(res => res.json())
            .then(data => {
                setCajaActiva(!!data?.id)
                setCargando(false)
            })
            .catch(() => {
                setCajaActiva(false)
                setCargando(false)
            })
    }, [])

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

    useEffect(() => {
        setMontoPago1(total)
        setMontoPago2(0)
        setMedioPago2('')
    }, [detalle])

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
            detalle: detalle.map(item => ({
                varianteId: item.varianteId,
                cantidad: item.cantidad,
                precio: item.precio
            })),
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
            alert('Error: ' + (error.error || 'No se pudo registrar la venta'))
        }
    }

    if (cargando) return <p className="p-4">Cargando...</p>

    if (!cajaActiva) {
        return (
            <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center space-y-4">
                <h2 className="text-xl font-bold text-red-600">⚠️ Caja no abierta</h2>
                <p>No se puede realizar una venta sin abrir caja.</p>
                <Button onClick={() => router.push('/caja?volver=/ventas/nueva')}>Ir a abrir caja</Button>
            </div>
        )
    }

return (

    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="text-xs text-muted-foreground">Fecha</label>
                <Input value={fecha} readOnly className="bg-muted" />
            </div>
            <div>
                <label className="text-xs text-muted-foreground">Comprobante</label>
                <Input value={nroComprobante} readOnly className="bg-muted font-mono" />
            </div>
            <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Cliente</label>
                <Select value={String(clienteId)} onValueChange={v => setClienteId(Number(v))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        {clientes.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.nombre} {c.apellido}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="text-xs px-0" onClick={() => setModalCliente(true)}>
                    + Nuevo cliente
                </Button>
            </div>
        </div>

        {/* Búsqueda de artículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                placeholder="Buscar artículo"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
            />
            <Input
                placeholder="Escanear código de barras"
                value={codigoBarra}
                onChange={e => setCodigoBarra(e.target.value)}
            />
        </div>
        {/* Resultados */}
        {resultados.length > 0 && (
            <ul className="border rounded shadow bg-white text-sm max-h-48 overflow-auto divide-y mt-1">
                {resultados.map(v => (
                    <li
                        key={v.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
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

        {/* Detalle de artículos */}
        <div className="border rounded max-h-64 overflow-auto text-sm">
            <table className="w-full text-left">
                <thead className="bg-muted text-xs">
                    <tr>
                        <th className="p-2">Código</th>
                        <th className="p-2">Descripción</th>
                        <th className="p-2 text-right">Cantidad</th>
                        <th className="p-2 text-right">Precio</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {detalle.map((item, i) => (
                        <tr key={i} className={item.cantidad < 0 ? 'bg-yellow-100' : ''}>
                            <td className="p-2 font-mono">{item.codigo}</td>
                            <td className="p-2">{item.descripcion}</td>
                            <td className="p-2 text-right">
                                <Input
                                    type="number"
                                    value={item.cantidad}
                                    className="w-20 text-right"
                                    onChange={(e) =>
                                        setDetalle(prev =>
                                            prev.map((art, j) =>
                                                j === i ? { ...art, cantidad: Number(e.target.value) } : art
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td className="p-2 text-right">{formatCurrency(item.precio)}</td>
                            <td className="p-2 text-right">{formatCurrency(item.precio * item.cantidad)}</td>
                            <td className="p-2 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => setDetalle(prev => prev.filter((_, j) => j !== i))}
                                >
                                    ✕
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Totales y descuentos */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
                <label className="text-xs">Desc %</label>
                <Input type="number" value={descuentoPorc} onChange={e => setDescuentoPorc(Number(e.target.value))} />
            </div>
            <div>
                <label className="text-xs">Desc manual</label>
                <Input type="number" value={descuentoManual} onChange={e => setDescuentoManual(e.target.value)} />
            </div>
            <div>
                <label className="text-xs">Unidades</label>
                <Input value={unidades} readOnly className="bg-muted" />
            </div>
            <div>
                <label className="text-xs">Subtotal</label>
                <Input value={formatCurrency(subtotal)} readOnly className="bg-muted" />
            </div>
            <div>
                <label className="text-xs">Total</label>
                <Input value={formatCurrency(total)} readOnly className="bg-muted font-bold" />
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
                <label className="text-xs">Pago cliente</label>
                <Input type="number" value={pagoCliente} onChange={e => setPagoCliente(Number(e.target.value))} />
            </div>
            <div>
                <label className="text-xs">Vuelto</label>
                <Input value={vuelto > 0 ? formatCurrency(vuelto) : '$0'} readOnly className="bg-muted" />
            </div>
        </div>

        {/* Medios de pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-xs">Medio de pago 1</label>
                <Select value={medioPago1} onValueChange={setMedioPago1}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                        {mediosPago.map(mp => (
                            <SelectItem key={mp.id} value={String(mp.id)}>{mp.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    value={montoPago1}
                    onChange={e => handleMontoPago1Change(Number(e.target.value))}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="text-xs">Medio de pago 2</label>
                <Select value={medioPago2} onValueChange={setMedioPago2} disabled={!montoPago2}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                        {mediosPago.map(mp => (
                            <SelectItem key={mp.id} value={String(mp.id)}>{mp.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    value={montoPago2}
                    readOnly
                    className="mt-1 bg-muted"
                />
            </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between pt-4">
            <Button variant="default" onClick={() => router.push('/')}>
                Cancelar
            </Button>
            <Button variant="default" onClick={confirmarVenta} className="text-white">
                Generar venta
            </Button>
        </div>

        {/* Modal crear cliente */}
        <ModalCrearCliente
            isOpen={modalCliente}
            onClose={() => setModalCliente(false)}
            onCreated={async () => {
                const res = await fetch('/api/clientes')
                const data = await res.json()
                setClientes(data)
                setClienteId(data.at(-1).id)
            }}
        />
    </div>
)
}