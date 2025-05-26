'use client'

import Link from 'next/link'
import { Upload, Package, User, Truck, Tag, CreditCard, FileDown, ReceiptText, ArrowLeft } from 'lucide-react'

export default function ImportarIndexPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-sm text-gray-800 space-y-6">
      <h1 className="text-2xl font-semibold">Importar datos</h1>
      <p className="text-gray-600">
        Seleccioná el tipo de dato que querés importar desde un archivo Excel. Asegurate de seguir el formato correspondiente.
      </p>

      <ul className="space-y-2">
        <li>
          <Link
            href="/importar/productos"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <Package size={16} /> Productos y variantes
          </Link>
        </li>
        <li>
          <Link
            href="/importar/clientes"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <User size={16} /> Clientes
          </Link>
        </li>
        <li>
          <Link
            href="/importar/proveedores"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <Truck size={16} /> Proveedores
          </Link>
        </li>
        <li>
          <Link
            href="/importar/categorias"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <Tag size={16} /> Categorías
          </Link>
        </li>
        <li>
          <Link
            href="/importar/medios-pago"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <CreditCard size={16} /> Medios de pago
          </Link>
        </li>
        <li>
          <Link
            href="/importar/movimientos"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <FileDown size={16} /> Movimientos de stock
          </Link>
        </li>
        <li>
          <Link
            href="/importar/ventas"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <ReceiptText size={16} /> Ventas históricas
          </Link>
        </li>
        <li>
          <Link
            href="/importar/compras"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded text-blue-700 transition"
          >
            <Upload size={16} /> Compras históricas
          </Link>
        </li>
      </ul>

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    </div>
  )
}