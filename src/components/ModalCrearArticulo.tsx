// src/components/ModalCrearArticulo.tsx
import { useState, useEffect } from 'react'
import { Articulo } from '@/types'
import FormArticulo from '@/components/FormArticulo'

type Props = {
  onClose: () => void
  onArticuloCreado: () => void
}

export default function ModalCrearArticulo({ onClose, onArticuloCreado }: Props) {
  const [descripcion, setDescripcion] = useState('')
  const [costo, setCosto] = useState(0)
  const [margen, setMargen] = useState(120)
  const [talles, setTalles] = useState('')
  const [colores, setColores] = useState('')
  const [codigo, setCodigo] = useState('')

  useEffect(() => {
    fetch('/api/contador/proximo?nombre=articulo')
      .then(res => res.json())
      .then(data => setCodigo(data.valor))
      .catch(err => {
        console.error('Error al obtener el código del artículo:', err)
        alert('No se pudo generar el código automáticamente.')
      })
  }, [])

  const calcularPrecio = () => {
    const precioBase = costo + (costo * (margen / 100))
    return Math.ceil(precioBase / 1000) * 1000
  }

  const handleGuardar = async () => {
    const variantes = []
    const listaTalles = talles.split(',').map(t => t.trim()).filter(t => t)
    const listaColores = colores.split(',').map(c => c.trim()).filter(c => c)

    for (const talle of listaTalles) {
      for (const color of listaColores) {
        variantes.push({ talle, color })
      }
    }

    const res = await fetch('/api/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo,
        descripcion,
        costo,
        margen,
        precioVenta: calcularPrecio(),
        variantes
      })
    })

    if (res.ok) {
      alert('Artículo creado')
      onArticuloCreado()
      onClose()
    } else {
      const errorText = await res.text()
      console.error('❌ Error al crear artículo:', errorText)
      alert('Error al crear artículo')
    }

  }

  return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded shadow max-h-screen overflow-y-auto w-full max-w-4xl">
    <FormArticulo
      modo="modal"
      onClose={onClose}
      onArticuloCreado={onArticuloCreado}
    />
  </div>
</div>

  )
}
