import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import ModalArticulosCategoria from './ModalArticulosCategoria'

export default function GraficoCategorias() {
  const [data, setData] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null)
  const alturaPorCategoria = 80
  const height = data.length * alturaPorCategoria

  useEffect(() => {
    fetch('/api/reportes/categorias')
      .then(res => res.json())
      .then(setData)
  }, [])

  const formatCantidad = (value: number) => value.toLocaleString('es-AR')

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full h-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📊 Ventas por Categoría</h2>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={16}
          margin={{ top: 10, right: 40, left: 80, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis dataKey="nombre" type="category" width={1} />
          <Bar
            dataKey="cantidad"
            barSize={30}
            onClick={(data: any) => setCategoriaSeleccionada(data.nombre)}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="cantidad"
              position="insideRight"
              formatter={formatCantidad}
              fill="white"
              style={{ fontWeight: 600 }}
            />
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="#000" cursor="pointer" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {categoriaSeleccionada && (
        <ModalArticulosCategoria
          categoria={categoriaSeleccionada}
          onClose={() => setCategoriaSeleccionada(null)}
        />
      )}
    </div>
  )
}