import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import bwipjs from 'bwip-js'

const ETIQUETA_WIDTH = 141.7 // 50 mm
const ETIQUETA_HEIGHT = 70.8 // 25 mm

interface VarianteEtiqueta {
  producto: {
    codigo: string
    descripcion: string
  }
  talle: string
  color: string
  codBarra: string
  cantidad: number
}

export async function POST(req: NextRequest) {
  try {
    const variantes: VarianteEtiqueta[] = await req.json()
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    for (const v of variantes) {
      for (let i = 0; i < v.cantidad; i++) {
        const page = pdfDoc.addPage([ETIQUETA_WIDTH, ETIQUETA_HEIGHT])

        const centerText = (text: string, y: number, size: number) => {
          const textWidth = font.widthOfTextAtSize(text, size)
          const x = (ETIQUETA_WIDTH - textWidth) / 2
          page.drawText(text, { x, y, size, font })
        }

        // Generar imagen PNG del código de barras
        const png = await bwipjs.toBuffer({
          bcid: 'code128',
          text: v.codBarra,
          scale: 2,
          height: 10,
          includetext: false,
        })

        const barcodeImage = await pdfDoc.embedPng(png)

        // Dibujar campos
        centerText(`Cod: ${v.producto.codigo}`, 52, 9)
        centerText(v.producto.descripcion, 40, 9)
        centerText(`Talle: ${v.talle} - Color: ${v.color}`, 28, 9)

        page.drawImage(barcodeImage, {
          x: 20,
          y: 4,
          width: 100,
          height: 20,
        })
      }
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="etiquetas.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generando PDF con código de barras:', error)
    return NextResponse.json({ error: 'No se pudo generar el PDF' }, { status: 500 })
  }
}