import { prisma } from "lala/lib/db";
import Link from "next/link";

export default async function ProveedoresPage() {
  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Proveedores</h1>
        <Link href="/proveedores/nuevo">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Nuevo</button>
        </Link>
      </div>
      {proveedores.length === 0 ? (
        <p>No hay proveedores cargados.</p>
      ) : (
        <ul className="space-y-2">
          {proveedores.map((prov) => (
            <li key={prov.id} className="border p-2 rounded">
              <strong>{prov.nombre}</strong><br />
              {prov.telefono || "Sin teléfono"} — {prov.email || "Sin email"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}