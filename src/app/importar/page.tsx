// app/(privado)/importar/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ImportarPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setArchivo(file)
  }

  const handleDescargar = () => {
    const encabezados = 'codigo,descripcion,proveedor,categoria,costo,precio,talle,color,stock,codBarra\n'
    const blob = new Blob([encabezados], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'productos_base.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportar = async () => {
    if (!archivo) return toast.error('Seleccioná un archivo CSV')
    const formData = new FormData()
    formData.append('file', archivo)
    setCargando(true)
    try {
      const res = await fetch('/api/importar', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Importación completa')
      } else {
        toast.error(data.error || 'Error al importar')
      }
    } catch (err) {
      toast.error('Error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📦 Importar Productos</h1>
      <p className="text-sm text-muted-foreground">
        Descargá el archivo base, completalo con tus productos y volvé a subirlo para importar los datos iniciales.
      </p>

      <Button onClick={handleDescargar} variant="outline">
        Descargar archivo base
      </Button>

      <Input type="file" accept=".csv" onChange={handleArchivo} />

      <Button onClick={handleImportar} disabled={cargando}>
        {cargando ? 'Importando...' : 'Importar archivo'}
      </Button>
    </div>
  )
}