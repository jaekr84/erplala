'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Detalle = {
  medio: string
  total: number
}

export default function EstadoCajaPage() {
  const [ventas, setVentas] = useState<Detalle[]>([])

  useEffect(() => {
    fetch('/api/caja/estado-ventas')
      .then(res => res.json())
      .then(data => setVentas(data))
  }, [])

  const totalGeneral = ventas.reduce((acc, v) => acc + v.total, 0)

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Estado de Caja
        </CardTitle>
      </CardHeader>

      <CardContent>
        <table className="w-full text-sm border border-border rounded-md overflow-hidden">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left p-2">Medio de Pago</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v, i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-2">{v.medio}</td>
                <td className="p-2 text-right">
                  ${v.total.toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold bg-muted/50">
              <td className="p-2">Total</td>
              <td className="p-2 text-right">
                ${totalGeneral.toLocaleString('es-AR')}
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}