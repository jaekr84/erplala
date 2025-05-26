// types.ts

export type Proveedor = {
  id: number;
  nombre: string;
};

export type Variante = {
  id: number;
  codBarra: string;
  talle: string;
  color: string;
  stock: number;
  costo?: number;
  codigo: string;
};

export type Articulo = {
  id: number;
  codigo: string;
  descripcion: string;
  costo: number;
  variantes: Variante[];
};

export type VarianteCompra = Variante & {
  descripcion: string;
  cantidad: number;
  costo: number;
};

// Tipo compartido: Detalle de variante de producto para compras/ventas completas
export type VarianteDetallada = {
  talle: string;
  color: string;
  producto: {
    descripcion: string;
    codigo: string;
  };
};

// Detalle de una línea de compra o venta
export type DetalleMovimiento = {
  id: number;
  cantidad: number;
  costo: number;
  variante: VarianteDetallada;
};

// Compra con proveedor, detalles y comprobante
export type CompraConDetalles = {
  id: number;
  nroComprobante: string;
  fecha: string;
  proveedor: {
    nombre: string;
  };
  total: number;
  detalles: DetalleMovimiento[];
};

// (Opcional) Venta con cliente, detalles y comprobante
export type VentaConDetalles = {
  id: number;
  nroComprobante: string;
  fecha: string;
  cliente?: {
    nombre: string;
  };
  total: number;
  detalles: DetalleMovimiento[];
};

// Artículo completo con variantes para edición o visualización detallada
export type ArticuloCompleto = {
  id: number;
  codigo: string;
  descripcion: string;
  costo: number;
  margen: number;
  precioVenta: number;
  proveedor: { nombre: string };
  categoria: { nombre: string };
  createdAt: string;
  variantes: Variante[];
};
export type NuevaCompraPayload = {
  proveedorId: number
  descuento?: number
  variantes: {
    id: number
    cantidad: number
    costo: number
  }[]
}
export type NuevoArticuloPayload = {
  descripcion: string
  costo: number
  margen: number
  proveedorId: number
  categoriaId: number
  talles: string[]
  colores: string[]
}