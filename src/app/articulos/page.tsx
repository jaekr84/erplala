import { prisma } from "lala/lib/db"
import Link from "next/link"

export default async function ArticulosPage() {
  const articulos = await prisma.producto.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      proveedor: true,
      categoria: true,
      variantes: true,
    },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listado de Artículos</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            ← Volver al inicio
          </button>
        </Link>
      </div>

      {articulos.length === 0 ? (
        <p>No hay artículos cargados.</p>
      ) : (
        <div className="space-y-6">
          {articulos.map((a) => (
            <div key={a.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{a.descripcion}</h2>
                  <p className="text-sm text-gray-600">
                    Código: <strong>{a.codigo}</strong> — Costo: ${a.costo} — Venta: ${a.precioVenta}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proveedor: {a.proveedor?.nombre || '—'} | Categoría: {a.categoria?.nombre || '—'}
                  </p>
                  <p className="text-sm text-gray-400">Fecha: {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {a.variantes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Variantes:</h3>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Talle</th>
                        <th className="p-2 text-left">Color</th>
                        <th className="p-2 text-left">Stock</th>
                        <th className="p-2 text-left">Precio</th>
                        <th className="p-2 text-left">Código de barra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.variantes.map((v) => (
                        <tr key={v.id} className="border-t">
                          <td className="p-2">{v.talle}</td>
                          <td className="p-2">{v.color}</td>
                          <td className="p-2">{v.stock}</td>
                          <td className="p-2">{a.precioVenta}</td>
                          <td className="p-2">{v.codBarra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
