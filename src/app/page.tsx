import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-10 tracking-tight">
          Bienvenido al ERP <span className="text-blue-600">Lalá</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/proveedores"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Proveedores
          </Link>

          <Link
            href="/categorias"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Categorías
          </Link>

          <Link
            href="/contadores"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Contadores
          </Link>

          <Link
            href="/articulos"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Lista de Artículos
          </Link>

          <Link
            href="/articulos/nuevo"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Nuevo Artículo
          </Link>

          <Link
            href="/compras/nueva"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Nueva Compra
          </Link>

          <Link
            href="/compras"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Lista de Compras
          </Link>

          <Link
            href="/clientes"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Lista de Clientes
          </Link>

          <Link
            href="/clientes/nuevo"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Nuevo Cliente
          </Link>
          <Link
            href="/medios-pago"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Medios de Pago
          </Link>
          <Link
            href="/ventas/nueva"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Nueva Venta
          </Link>
          <Link
            href="/ventas"
            className="block w-full bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition p-4 text-gray-700 text-sm font-medium text-center"
          >
            Ventas
          </Link>
        </div>
      </div>
    </div>
  );
}