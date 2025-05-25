import { useState } from 'react';
import { Articulo, VarianteCompra } from '@/types';

type Props = {
  articulo: Articulo;
  onClose: () => void;
  onAgregar: (variantes: VarianteCompra[]) => void;
};

export default function ModalVariantes({ articulo, onClose, onAgregar }: Props) {
  const [cantidades, setCantidades] = useState<{ [id: number]: number }>({});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">{articulo.descripcion}</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Talle</th>
              <th className="p-2">Color</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Costo</th>
              <th className="p-2">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {articulo.variantes.map((v) => (
              <tr key={v.id}>
                <td className="p-2">{v.talle}</td>
                <td className="p-2">{v.color}</td>
                <td className="p-2">{v.stock}</td>
                <td className="p-2">{v.costo ?? articulo.costo}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 w-16"
                    min={0}
                    value={cantidades[v.id] || ''}
                    onChange={(e) =>
                      setCantidades({ ...cantidades, [v.id]: Number(e.target.value) })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            const seleccionadas = articulo.variantes
              .filter((v) => cantidades[v.id] > 0)
              .map((v) => ({
                ...v,
                codigo: articulo.codigo,
                descripcion: articulo.descripcion,
                cantidad: cantidades[v.id],
                costo: v.costo ?? articulo.costo,
              }));
            onAgregar(seleccionadas);
          }}
        >
          Agregar a la compra
        </button>
      </div>
    </div>
  );
}
