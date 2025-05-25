'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import ModalDetalleCompra from '@/components/ModalDetalleCompra'

// Tipos
type Variante = {
    codBarra: string
    producto: {
        descripcion: string
    }
    talle: string
    color: string
}

type DetalleCompra = {
    id: number
    variante: Variante
    cantidad: number
    costo: number
}

type Compra = {
    id: number
    fecha: string
    proveedor: {
        nombre: string
    }
    total: number
    detalles: DetalleCompra[]
}

// Formateador de moneda
const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(value)

export default function ComprasPage() {
    const [compras, setCompras] = useState<Compra[]>([])
    const [error, setError] = useState<string | null>(null)
    const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null)

    useEffect(() => {
        fetch('/api/compras')
            .then(res => {
                if (!res.ok) throw new Error('No se pudo obtener el listado de compras')
                return res.json()
            })
            .then(data => setCompras(data))
            .catch(err => setError(err.message))
    }, [])

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Listado de Compras</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 text-right">
                <Link href="/compras/nueva">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        + Crear compra
                    </button>
                </Link>
            </div>

            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Proveedor</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {compras.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-500">
                                No hay compras registradas.
                            </td>
                        </tr>
                    ) : (
                        compras.map(compra => (
                            <tr
                                key={compra.id}
                                className="border-t cursor-pointer hover:bg-gray-50"
                                onClick={() => setCompraSeleccionada(compra)}
                            >
                                <td className="p-2">{new Date(compra.fecha).toLocaleDateString()}</td>
                                <td className="p-2">{compra.proveedor?.nombre}</td>
                                <td className="p-2">{formatCurrency(compra.total)}</td>
                                <td className="p-2 text-blue-600">Ver detalles</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {compraSeleccionada && (
                <ModalDetalleCompra
                    compra={compraSeleccionada}
                    onClose={() => setCompraSeleccionada(null)}
                />
            )}
        </div>
    )
}
