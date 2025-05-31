import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file)
      return NextResponse.json(
        { error: "No se subió ningún archivo" },
        { status: 400 }
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const contenido = buffer.toString('utf-8').replace(/^\uFEFF/, '')
    const registros = parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ";", // <-- esto permite leer archivos separados por punto y coma
    });

    let contador = 0;
    for (const row of registros) {
      const precio = row["precio"] || row["precio venta"] || "";
      const codBarra = row["codBarra"] || row["codigo barra"] || "";
      const {
        codigo,
        descripcion,
        proveedor,
        categoria,
        costo,
        talle,
        color,
        stock,
      } = row;
      console.log("👉 Fila:", row);

      if (!codigo || !descripcion || !proveedor || !categoria) {
        console.log("⛔ Fila incompleta - se omite");
        continue;
      }

      const proveedorDB = await prisma.proveedor.upsert({
        where: { nombre: proveedor },
        update: {},
        create: { nombre: proveedor },
      });

      const categoriaDB = await prisma.categoria.upsert({
        where: { nombre: categoria },
        update: {},
        create: { nombre: categoria },
      });

      const productoDB = await prisma.producto.upsert({
        where: { codigo },
        update: {},
        create: {
          codigo,
          descripcion,
          costo: parseFloat(costo),
          margen: 0,
          precioVenta: parseFloat(precio),
          proveedorId: proveedorDB.id,
          categoriaId: categoriaDB.id,
        },
      });

      const codBarraFinal = String(codBarra || "").trim();

      if (!codBarraFinal) {
        console.log(`⚠️ Sin código de barra para producto ${codigo}`);
        continue;
      }

      const yaExiste = await prisma.variante.findUnique({
        where: { codBarra: codBarraFinal },
      });

      if (!yaExiste) {
        await prisma.variante.create({
          data: {
            codBarra: codBarraFinal,
            talle,
            color,
            stock: parseInt(stock) || 0,
            productoId: productoDB.id,
          },
        });
        contador++;
        console.log(`✅ Variante creada: ${codBarraFinal}`);
      } else {
        console.log(`🔁 Variante ya existe: ${codBarraFinal}`);
      }
    }

    console.log(`✅ Importación finalizada: ${contador} variantes creadas`);
    return NextResponse.json({ ok: true, variantesCreadas: contador });
  } catch (error) {
    console.error("❌ Error al importar:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo" },
      { status: 500 }
    );
  }
}
