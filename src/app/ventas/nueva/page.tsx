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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
    const [modalAbierto, setModalAbierto] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [ventaConfirmada, setVentaConfirmada] = useState<{ id: number; nroComprobante: number } | null>(null)
    const toggleParaCambio = (varianteId: number) => {
        setDetalle(prev =>
            prev.map(item =>
                item.varianteId === varianteId
                    ? { ...item, paraCambio: !item.paraCambio }
                    : item
            )
        )
    }
    const [query, setQuery] = useState('')
    const [sugerencias, setSugerencias] = useState<VarianteConProducto[]>([])
    const [clienteEmail, setClienteEmail] = useState<string>('')

    const enviarComprobante = async () => {
        if (!ventaConfirmada?.id) {
            alert('No hay venta confirmada para enviar el comprobante.')
            return
        }

        const resTxt = await fetch(`/api/tickets/venta/${ventaConfirmada.id}/txt`)
        const texto = await resTxt.text()

        const res = await fetch('/api/enviar-comprobante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emailDestino: clienteEmail || 'test@cliente.com',
                contenido: texto,
                nombreAdjunto: `comprobante_${ventaConfirmada.id}.txt`
            })
        })

        if (res.ok) {
            toast.success('📧 Enviado correctamente', {
                description: 'El comprobante fue enviado al cliente.'
            })
            setShowModal(false)
        } else {
            toast.error('❌ Error al enviar', {
                description: 'No se pudo enviar el comprobante. Reintentá más tarde.'
            })
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            if (query.trim().length < 2) return setSugerencias([])

            const res = await fetch(`/api/variantes/buscar?q=${encodeURIComponent(query)}`)
            if (!res.ok) return

            const data = await res.json()
            setSugerencias(data)

            // Autocompletar si hay una sola coincidencia
            if (data.length === 1) {
                agregarAlDetalle(data[0])
                setQuery('')
                setSugerencias([])
            }
        }

        const delay = setTimeout(fetchData, 300)
        return () => clearTimeout(delay)
    }, [query])

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


    // --- Totales y descuentos (declarar antes del useEffect que los necesita) ---
    const subtotal = detalle.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    const unidades = detalle.reduce((sum, item) => sum + item.cantidad, 0)
    const rawDescuento = subtotal * (descuentoPorc / 100)
    const resto = rawDescuento % 1000
    const redondeado = resto >= 500
        ? Math.floor(rawDescuento / 1000) * 1000 + 1000
        : Math.floor(rawDescuento / 1000) * 1000
    const descuentoCalculado = descuentoManual ? Number(descuentoManual) : redondeado
    const total = subtotal - descuentoCalculado
    const vuelto = pagoCliente - total

    useEffect(() => {
        setMontoPago1(total)
        setMontoPago2(0)
        setMedioPago2('')
    }, [detalle, descuentoCalculado])

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
                precio: Number(v.producto.precioVenta) || 0,
                paraCambio: false
            }]
        })
    }


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
                precio: item.precio,
                paraCambio: item.paraCambio,
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
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            const datos = await res.json()
            setVentaConfirmada({
                id: datos.id,
                nroComprobante: datos.nroComprobante ?? datos.id
            })
            setModalAbierto(true)
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

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 ">
            <p>Nueva Venta</p>
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
                        <SelectTrigger className='bg-white'>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input de búsqueda + dropdown */}
                <div className="relative">
                    <Input
                        placeholder="Buscar por código o descripción"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-white"
                    />

                    {sugerencias.length > 0 && (
                        <div className="absolute z-50 w-full bg-white border rounded shadow max-h-64 overflow-y-auto mt-1">
                            {sugerencias.map(v => (
                                <div
                                    key={v.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => {
                                        agregarAlDetalle(v)
                                        setQuery('')
                                        setSugerencias([])
                                    }}
                                >
                                    <div className="font-medium">{v.producto.descripcion}</div>
                                    <div className="text-xs text-gray-500">
                                        Código: {v.producto.codigo} — Talle: {v.talle} — Color: {v.color}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input de código de barras */}
                <Input
                    placeholder="Escanear código de barras"
                    value={codigoBarra}
                    onChange={e => setCodigoBarra(e.target.value)}
                    className="bg-white"
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

            <div className="border rounded h-64 overflow-y-auto text-sm bg-white dark:bg-zinc-900">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-zinc-800 text-xs sticky top-0 z-10">
                        <tr>
                            <th className="p-2">Código</th>
                            <th className="p-2">Descripción</th>
                            <th className="p-2 text-right">Cantidad</th>
                            <th className="p-2 text-right">Precio</th>
                            <th className="p-2 text-right">Subtotal</th>
                            <th className="p-2 text-right">Eliminar</th>
                            <th className="p-2 text-center">Tick.Camb.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalle.map((item, i) => (
                            <tr
                                key={i}
                                className={`
            ${item.cantidad < 0
                                        ? 'bg-yellow-100 dark:bg-yellow-900/40'
                                        : i % 2 === 0
                                            ? 'bg-white dark:bg-zinc-900'
                                            : 'bg-gray-50 dark:bg-zinc-800'
                                    }`}
                            >
                                {/* Código */}
                                <td className="p-2 font-mono">{item.codigo}</td>

                                {/* Descripción */}
                                <td className="p-2">{item.descripcion}</td>

                                {/* Cantidad */}
                                <td className="p-2 text-right">
                                    <Input
                                        type="number"
                                        value={item.cantidad}
                                        className="w-20 text-right"
                                        onChange={(e) =>
                                            setDetalle((prev) =>
                                                prev.map((art, j) =>
                                                    j === i ? { ...art, cantidad: Number(e.target.value) } : art
                                                )
                                            )
                                        }
                                    />
                                </td>

                                {/* Precio */}
                                <td className="p-2 text-right">{formatCurrency(item.precio)}</td>

                                {/* Subtotal */}
                                <td className="p-2 text-right">{formatCurrency(item.precio * item.cantidad)}</td>

                                {/* Eliminar */}
                                <td className="p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() =>
                                            setDetalle((prev) => prev.filter((_, j) => j !== i))
                                        }
                                    >
                                        ✕
                                    </Button>
                                </td>

                                {/* Ticket de cambio */}
                                <td className="p-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={item.paraCambio ?? false}
                                        onChange={() => toggleParaCambio(item.varianteId)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* descuentos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs">Descuento %</label>
                    <Input
                        className='bg-white'
                        type="number"
                        value={descuentoPorc === 0 ? '' : descuentoPorc}
                        onChange={e => {
                            const value = e.target.value
                            setDescuentoPorc(value === '' ? 0 : Number(value))
                            setDescuentoManual('')
                        }}
                        disabled={!!descuentoManual}
                    />
                </div>
                <div>
                    <label className="text-xs">Descuento manual</label>
                    <Input
                        className='bg-white'
                        type="number"
                        value={descuentoManual}
                        onChange={e => {
                            setDescuentoManual(e.target.value)
                            setDescuentoPorc(0)
                        }}
                        disabled={!!descuentoPorc}
                    />
                </div>
                <div>
                    <label className="text-xs">Descuento aplicado</label>
                    <Input
                        readOnly
                        className='bg-muted font-semibold'
                        type="text"
                        value={formatCurrency(descuentoCalculado)}
                    />
                </div>
            </div>


            {/* Totales */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    <Input
                        className='bg-white'
                        type="number"
                        value={pagoCliente === 0 ? '' : pagoCliente}
                        onChange={e => {
                            const value = e.target.value
                            setPagoCliente(value === '' ? 0 : Number(value))
                        }}
                    />
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
                        <SelectTrigger className='bg-white'>
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
                        value={montoPago1 === 0 ? '' : montoPago1}
                        onChange={e => {
                            const value = e.target.value
                            handleMontoPago1Change(value === '' ? 0 : Number(value))
                        }}
                        className="mt-1 bg-white"
                    />
                </div>
                <div>
                    <label className="text-xs">Medio de pago 2</label>
                    <Select value={medioPago2} onValueChange={setMedioPago2} disabled={!montoPago2}>
                        <SelectTrigger className='bg-white'>
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
                        value={montoPago2 === 0 ? '' : montoPago2}
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
                    Confirmar Venta
                </Button>
            </div>

            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">✅ Venta registrada</DialogTitle>
                    </DialogHeader>

                    <div className="text-sm text-gray-600 mb-4">
                        La venta fue registrada correctamente. ¿Qué querés hacer ahora?
                    </div>

                    <div className="flex flex-col gap-2">
                        {/*<Button
                            variant="default"
                            onClick={() =>
                                window.open(`/api/tickets/venta/${ventaConfirmada?.id}`, '_blank')
                            }
                        >
                            🧾 Imprimir ticket de venta
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() =>
                                window.open(`/api/tickets/cambio/${ventaConfirmada?.id}`, '_blank')
                            }
                        >
                            🔁 Imprimir ticket de cambio
                        </Button>

                        {/* Campo para escribir el email del cliente */}
                        <Input
                            type="email"
                            placeholder="Email del cliente"
                            value={clienteEmail}
                            onChange={(e) => setClienteEmail(e.target.value)}
                        />

                        {/* Botón para enviar comprobante y cambio si corresponde */}
                        <Button
                            variant="default"
                            onClick={async () => {
                                if (!ventaConfirmada?.id || !clienteEmail) {
                                    return alert('Falta el ID de la venta o el email')
                                }

                                // Fecha y comprobante para nombre
                                const fecha = new Date()
                                const fechaStr = fecha.toISOString().slice(0, 10)
                                const nroStr = `V${ventaConfirmada.nroComprobante
                                    ?.toString()
                                    .padStart(7, '0') || ventaConfirmada.id}`

                                // Buscar contenido del comprobante de venta
                                const resVenta = await fetch(`/api/tickets/venta/${ventaConfirmada.id}/txt`)
                                const contenidoVenta = await resVenta.text()

                                let contenidoCambio = ''
                                const hayCambio = detalle.some(item => item.paraCambio)
                                if (hayCambio) {
                                    const resCambio = await fetch(`/api/tickets/cambio/${ventaConfirmada.id}/txt`)
                                    contenidoCambio = await resCambio.text()
                                }

                                const res = await fetch('/api/enviar-comprobante', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        emailDestino: clienteEmail,
                                        contenidoVenta,
                                        contenidoCambio: hayCambio ? contenidoCambio : null,
                                        nombreVenta: `venta_${fechaStr}_${nroStr}.pdf`,
                                        nombreCambio: hayCambio ? `cambio_${fechaStr}_${nroStr}.pdf` : null
                                    })
                                })

                                if (res.ok) {
                                    toast.success('📧 Enviado correctamente', {
                                        description: 'El comprobante fue enviado al cliente.'
                                    })
                                    setShowModal(false)
                                } else {
                                    toast.error('❌ Error al enviar', {
                                        description: 'No se pudo enviar el comprobante. Reintentá más tarde.'
                                    })
                                }
                            }}
                        >
                            📤 Enviar comprobante por email
                        </Button>

                        <Button variant="ghost" onClick={() => router.push('/')}>
                            ❌ Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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