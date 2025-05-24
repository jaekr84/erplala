import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-8">Bienvenido al ERP Lalá</h1>

      <div className="flex gap-6">
        <Link href="/proveedores">
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Proveedores
          </button>
        </Link>

        <Link href="/categorias">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Categorías
          </button>
        </Link>

        <Link href="/contadores">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Contadores
          </button>
        </Link>

        <Link href="/articulos">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Lista de Artículos
          </button>
        </Link>
        <Link href="/articulos/nuevo">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Nuevo Artículo
          </button>
        </Link>
      </div>
    </div>
  );
}
