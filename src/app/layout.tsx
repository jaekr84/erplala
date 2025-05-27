'use client'

import './globals.css'
import Link from 'next/link'
import {
  Home,
  Truck,
  ListOrdered,
  Settings,
  Package,
  Plus,
  ShoppingCart,
  Users,
  UserPlus,
  Receipt,
  Wrench,
  CreditCard,
  BarChart2,
  TagIcon,
  StoreIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Estados para cada grupo
  const [openVentas, setOpenVentas] = useState(true)
  const [openCompras, setOpenCompras] = useState(false)
  const [openArticulos, setOpenArticulos] = useState(false)
  const [openClientes, setOpenClientes] = useState(false)
  const [openConfig, setOpenConfig] = useState(false)
  const [openUtilidades, setOpenUtilidades] = useState(false)

  const toggle = (fn: React.Dispatch<React.SetStateAction<boolean>>) => fn(prev => !prev)

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r p-6 shadow-md flex flex-col overflow-y-auto">
            <h1 className="text-xl font-bold text-blue-600 mb-6">ERP Lalá</h1>

            {/* Botón Home */}
            <Link
              href="/"
              className="flex items-center gap-3 text-white font-semibold bg-blue-600 rounded-md px-4 py-2 hover:bg-blue-700 transition mb-6"
            >
              <Home size={18} /> Inicio
            </Link>

            {/* Navegación */}
            <nav className="flex flex-col gap-2 text-sm">

              {/* Grupo Ventas */}
              <button
                onClick={() => toggle(setOpenVentas)}
                className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1"
              >
                <span>Ventas</span> {openVentas ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openVentas && (
                <div className="ml-2">
                  <Link href="/ventas/nueva" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Receipt size={16} /> Nueva Venta
                  </Link>
                  <Link href="/ventas" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <ListOrdered size={16} /> Lista de Ventas
                  </Link>
                </div>
              )}

              {/* Grupo Compras */}
              <button onClick={() => toggle(setOpenCompras)} className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1">
                <span>Compras</span> {openCompras ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openCompras && (
                <div className="ml-2">
                  <Link href="/compras/nueva" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <ShoppingCart size={16} /> Nueva Compra
                  </Link>
                  <Link href="/compras" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <ListOrdered size={16} /> Lista de Compras
                  </Link>
                </div>
              )}

              {/* Grupo Artículos */}
              <button onClick={() => toggle(setOpenArticulos)} className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1">
                <span>Artículos y Stock</span> {openArticulos ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openArticulos && (
                <div className="ml-2">
                  <Link href="/articulos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Package size={16} /> Lista de Artículos
                  </Link>
                  <Link href="/articulos/nuevo" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Plus size={16} /> Nuevo Artículo
                  </Link>
                  <Link href="/ajuste-stock" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Wrench size={16} /> Ajuste de Stock
                  </Link>
                </div>
              )}

              {/* Grupo Clientes */}
              <button onClick={() => toggle(setOpenClientes)} className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1">
                <span>Clientes</span> {openClientes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openClientes && (
                <div className="ml-2">
                  <Link href="/clientes" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Users size={16} /> Lista de Clientes
                  </Link>
                  <Link href="/clientes/nuevo" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <UserPlus size={16} /> Nuevo Cliente
                  </Link>
                </div>
              )}

              {/* Grupo Configuración */}
              <button onClick={() => toggle(setOpenConfig)} className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1">
                <span>Configuración</span> {openConfig ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openConfig && (
                <div className="ml-2">
                  <Link href="/proveedores" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Truck size={16} /> Proveedores
                  </Link>
                  <Link href="/categorias" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <ListOrdered size={16} /> Categorías
                  </Link>
                  <Link href="/medios-pago" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <CreditCard size={16} /> Medios de Pago
                  </Link>
                  <Link href="/contadores" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <Settings size={16} /> Contadores
                  </Link>
                  <Link href="/datosNegocio" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <StoreIcon size={16} /> Datos del Negocio
                  </Link>
                </div>
              )}

              {/* Grupo Utilidades */}
              <button onClick={() => toggle(setOpenUtilidades)} className="flex justify-between items-center text-xs text-gray-500 uppercase w-full px-1 py-1">
                <span>Utilidades</span> {openUtilidades ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {openUtilidades && (
                <div className="ml-2">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <BarChart2 size={16} /> Dashboard
                  </Link>
                  <Link href="/etiquetas" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition">
                    <TagIcon size={16} /> Etiquetas
                  </Link>
                </div>
              )}

            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}