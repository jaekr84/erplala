// app/layout.tsx
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
  Upload,
  CreditCard,
  BarChart2,
} from 'lucide-react'

export const metadata = {
  title: 'ERP Lalá',
  description: 'Sistema de gestión comercial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

            {/* Menú de navegación */}
            <nav className="flex flex-col gap-2 text-sm">
              {/* Ventas */}
              <Link href="/ventas/nueva" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Receipt size={18} /> Nueva Venta
              </Link>
              <Link href="/ventas" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <ListOrdered size={18} /> Lista de Ventas
              </Link>

              {/* Compras */}
              <Link href="/compras/nueva" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <ShoppingCart size={18} /> Nueva Compra
              </Link>
              <Link href="/compras" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <ListOrdered size={18} /> Lista de Compras
              </Link>

              {/* Artículos y stock */}
              <Link href="/articulos" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Package size={18} /> Lista de Artículos
              </Link>
              <Link href="/articulos/nuevo" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Plus size={18} /> Nuevo Artículo
              </Link>
              <Link href="/ajuste-stock" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Wrench size={18} /> Ajuste de Stock
              </Link>
              <Link href="/importar" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Upload size={18} /> Importación
              </Link>

              {/* Configuración */}
              <Link href="/proveedores" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Truck size={18} /> Proveedores
              </Link>
              <Link href="/categorias" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <ListOrdered size={18} /> Categorías
              </Link>
              <Link href="/contadores" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Settings size={18} /> Contadores
              </Link>
              <Link href="/medios-pago" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <CreditCard size={18} /> Medios de Pago
              </Link>

              {/* Clientes */}
              <Link href="/clientes" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <Users size={18} /> Lista de Clientes
              </Link>
              <Link href="/clientes/nuevo" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <UserPlus size={18} /> Nuevo Cliente
              </Link>

              {/* Dashboard */}
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
                <BarChart2 size={18} /> Dashboard
              </Link>
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}