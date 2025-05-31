import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const {
    emailDestino,
    contenidoVenta,
    contenidoCambio,
    nombreVenta,
    nombreCambio,
  } = await req.json();

  if (!emailDestino || !contenidoVenta) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  // Función para generar PDF desde texto
  const generarPDF = async (contenido: string, mensajeFinal: string) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([300, 500]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = 480;

    const drawLine = () => {
      y -= 12;
      page.drawText("--------------------------------", {
        x: 20,
        y,
        size: 8,
        font,
      });
    };

    contenido.split("\n").forEach((linea) => {
      y -= 12;
      page.drawText(linea, { x: 20, y, size: 8, font });
    });

    y -= 20;
    page.drawText(mensajeFinal, {
      x: 20,
      y,
      size: 9,
      font,
      color: rgb(0.1, 0.5, 0.1),
    });

    return await pdfDoc.save();
  };

  const pdfVenta = await generarPDF(contenidoVenta, "¡Gracias por tu compra! ");
  const pdfCambio = contenidoCambio
    ? await generarPDF(
        contenidoCambio,
        "Este ticket es válido solo para cambio."
      )
    : null;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Lalá" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: " Comprobante de compra - Lalá",
      text: "Adjuntamos tu comprobante de venta.\n¡Gracias por elegirnos!",
      attachments: [
        {
          filename: nombreVenta || "comprobante_venta.pdf",
          content: Buffer.from(pdfVenta),
          contentType: "application/pdf",
        },
        ...(pdfCambio
          ? [
              {
                filename: nombreCambio || "ticket_cambio.pdf",
                content: Buffer.from(pdfCambio),
                contentType: "application/pdf",
              },
            ]
          : []),
      ],
    });

    const nro = nombreVenta?.match(/V\d{7}/)?.[0] || null
    const venta = nro ? await prisma.venta.findUnique({ where: { nroComprobante: nro } }) : null
    if (venta) {
      try {
        await prisma.venta.update({
          where: { id: venta.id },
          data: { emailEnviadoA: emailDestino }
        });
      } catch (error) {
        console.warn("✅ Mail enviado, pero no se guardó emailEnviadoA:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("❌ Error al enviar mail:", error.message);
    return NextResponse.json(
      { error: error.message || "Error al enviar" },
      { status: 500 }
    );
  }
}
