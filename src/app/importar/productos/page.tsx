'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function ImportarProductosPage() {
  const [rows, setRows] = useState<any[]>([])
  const [fileName, setFileName] = useState('')
  const [errores, setErrores] = useState<string[]>([])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const hoja = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(hoja)
      setRows(json as any[])
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImportar = async () => {
    const erroresDetectados: string[] = []

    for (const [i, row] of rows.entries()) {
      if (!row.codigo || !row.codBarra || !row.descripcion || !row.precioVenta) {
        erroresDetectados.push(`Fila ${i + 2} incompleta`)
        continue
      }

      const res = await fetch('/api/importar-productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      })
      if (!res.ok) {
        const error = await res.json()
        erroresDetectados.push(`Fila ${i + 2}: ${error.message || 'Error'}`)
      }
    }

    setErrores(erroresDetectados)
    if (erroresDetectados.length === 0) alert('Importación finalizada')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-4">Importar productos desde Excel</h1>

      <p className="mb-2">Seleccioná un archivo con los campos: <code>codigo</code>, <code>descripcion</code>, <code>costo</code>, <code>proveedor</code>, <code>categoria</code>, <code>precioVenta</code>, <code>stock</code>, <code>codBarra</code>, <code>talle</code>, <code>color</code>.</p>

      <a
        href="/plantillas/plantilla_importacion_productos.xlsx"
        download
        className="text-blue-600 underline text-sm"
      >
        Descargar plantilla de ejemplo
      </a>

      <div className="mt-4">
        <input type="file" accept=".xls,.xlsx" onChange={handleFile} />
        {fileName && <p className="mt-1">📄 {fileName}</p>}
      </div>

      {rows.length > 0 && (
        <div className="mt-6 border rounded">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Código</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Cod. Barra</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-mono">{r.codigo}</td>
                  <td className="p-2">{r.descripcion}</td>
                  <td className="p-2">${r.precioVenta}</td>
                  <td className="p-2">{r.stock}</td>
                  <td className="p-2 font-mono">{r.codBarra}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImportar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Importar
            </button>
          </div>
        </div>
      )}

      {errores.length > 0 && (
        <div className="mt-6 bg-red-100 border border-red-300 p-3 rounded text-red-800">
          <strong>Errores:</strong>
          <ul className="list-disc pl-5 mt-2">
            {errores.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

    </div>

  )
}