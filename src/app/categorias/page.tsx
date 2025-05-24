import { prisma } from "lala/lib/db";
import Link from "next/link";
import { Categoria } from "@prisma/client";

export default async function CategoriasPage() {
  const categorias: Categoria[] = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Categorías</h1>
        <div className="flex gap-4">
          <Link href="/">
            <button className="bg-gray-400 text-white px-4 py-2 rounded">
              ← Home
            </button>
          </Link>
          <Link href="/categorias/nuevo">
            <button className="bg-green-600 text-white px-4 py-2 rounded">
              + Nueva
            </button>
          </Link>
        </div>
      </div>

      {categorias.length === 0 ? (
        <p>No hay categorías cargadas.</p>
      ) : (
        <ul className="space-y-2">
          {categorias.map((cat) => (
            <li key={cat.id} className="border p-2 rounded">
              {cat.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
