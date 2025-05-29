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
  WalletCards,
  BookOpenText,
  LockKeyhole,
  LockKeyholeOpen,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [openVentas, setOpenVentas] = useState(true)
  const [openCompras, setOpenCompras] = useState(false)
  const [openArticulos, setOpenArticulos] = useState(false)
  const [openClientes, setOpenClientes] = useState(false)
  const [openConfig, setOpenConfig] = useState(false)
  const [openUtilidades, setOpenUtilidades] = useState(false)
  const [openCaja, setOpenCaja] = useState(false)
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null)
  const toggle = (fn: React.Dispatch<React.SetStateAction<boolean>>) => fn(prev => !prev)

  useEffect(() => {
    fetch('/api/caja/estado')
      .then(res => res.json())
      .then(data => setCajaAbierta(!!data?.id))
      .catch(() => setCajaAbierta(false))
  }, [])

  return (
    <html lang="es">
      <body className="bg-muted text-muted-foreground">
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 bg-white border-r p-4 shadow-sm flex flex-col overflow-y-auto">
            <h1 className="text-xl font-bold text-primary mb-4">ERP Lalá</h1>

            <Button asChild className="mb-4">
              <Link href="/">
                <Home size={18} className="mr-2" /> Inicio
              </Link>
            </Button>

            <nav className="flex flex-col gap-1 text-sm">
              {/* Ventas */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full flex justify-between text-xs text-muted-foreground"
                  onClick={() => toggle(setOpenVentas)}
                >
                  <span>Ventas</span> {openVentas ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openVentas && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/ventas/nueva">
                        <Receipt size={16} className="mr-2" /> Nueva Venta
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/ventas">
                        <BookOpenText size={16} className="mr-2" /> Lista de Ventas
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Caja */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full flex justify-between text-xs text-muted-foreground"
                  onClick={() => toggle(setOpenCaja)}
                >
                  <span>Caja</span> {openCaja ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openCaja && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/caja" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
                        {cajaAbierta === null ? (
                          <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
                        ) : cajaAbierta ? (
                          <LockKeyholeOpen className="w-4 h-4 text-green-600" />
                        ) : (
                          <LockKeyhole className="w-4 h-4 text-red-600" />
                        )}
                        <span>Abrir/Cerrar Caja</span>
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/caja/estado">
                        <WalletCards size={16} className="mr-2" /> Estado de Caja
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/caja/historial">
                        <BookOpenText size={16} className="mr-2" /> Historial de Cajas
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Compras */}
              <div>
                <Button variant="ghost" className="w-full flex justify-between text-xs text-muted-foreground" onClick={() => toggle(setOpenCompras)}>
                  <span>Compras</span> {openCompras ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openCompras && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/compras/nueva">
                        <ShoppingCart size={16} className="mr-2" /> Nueva Compra
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/compras">
                        <ListOrdered size={16} className="mr-2" /> Lista de Compras
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Artículos */}
              <div>
                <Button variant="ghost" className="w-full flex justify-between text-xs text-muted-foreground" onClick={() => toggle(setOpenArticulos)}>
                  <span>Artículos y Stock</span> {openArticulos ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openArticulos && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/articulos">
                        <Package size={16} className="mr-2" /> Lista de Artículos
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/articulos/nuevo">
                        <Plus size={16} className="mr-2" /> Nuevo Artículo
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/ajuste-stock">
                        <Wrench size={16} className="mr-2" /> Ajuste de Stock
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Clientes */}
              <div>
                <Button variant="ghost" className="w-full flex justify-between text-xs text-muted-foreground" onClick={() => toggle(setOpenClientes)}>
                  <span>Clientes</span> {openClientes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openClientes && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/clientes">
                        <Users size={16} className="mr-2" /> Lista de Clientes
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/clientes/nuevo">
                        <UserPlus size={16} className="mr-2" /> Nuevo Cliente
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Configuración */}
              <div>
                <Button variant="ghost" className="w-full flex justify-between text-xs text-muted-foreground" onClick={() => toggle(setOpenConfig)}>
                  <span>Configuración</span> {openConfig ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openConfig && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/proveedores">
                        <Truck size={16} className="mr-2" /> Proveedores
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/proveedores/nuevo">
                        <Truck size={16} className="mr-2" /> Nuevo Proveedor
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/categorias">
                        <ListOrdered size={16} className="mr-2" /> Categorías
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/medios-pago">
                        <CreditCard size={16} className="mr-2" /> Medios de Pago
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/contadores">
                        <Settings size={16} className="mr-2" /> Contadores
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/datosNegocio">
                        <StoreIcon size={16} className="mr-2" /> Datos del Negocio
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Utilidades */}
              <div>
                <Button variant="ghost" className="w-full flex justify-between text-xs text-muted-foreground" onClick={() => toggle(setOpenUtilidades)}>
                  <span>Utilidades</span> {openUtilidades ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
                {openUtilidades && (
                  <div className="ml-2 space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/dashboard">
                        <BarChart2 size={16} className="mr-2" /> Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/etiquetas">
                        <TagIcon size={16} className="mr-2" /> Etiquetas
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/importar">
                        <TagIcon size={16} className="mr-2" /> Importar
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto p-8 bg-muted">{children}</main>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
