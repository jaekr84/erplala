// types.ts

export type Cliente = {
  id: number
  nombre: string
  apellido: string
  dni?: string
  telefono?: string
  email?: string
  fechaNac?: string
  createdAt: string
  updatedAt: string
}

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

export type VarianteDetallada = {
  talle: string;
  color: string;
  producto: {
    descripcion: string;
    codigo: string;
  };
};

export type DetalleMovimiento = {
  id: number;
  cantidad: number;
  costo: number;
  variante: VarianteDetallada;
};

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

export type VarianteConProducto = {
  id: number;
  codBarra: string;
  talle: string;
  color: string;
  stock: number;
  producto: {
    codigo: string;
    descripcion: string;
    precioVenta: number;
  };
}

export type MedioPago = {
  id: number;
  nombre: string;
};

export type VentaConDetalles = {
  id: number
  nroComprobante: string
  fecha: string
  total: number
  cliente: {
    nombre: string
  } | null
  detalles: {
    id: number
    cantidad: number
    precio: number // ← este campo es el que falta
    variante: {
      talle: string
      color: string
      producto: {
        codigo: string
        descripcion: string
      }
    }
  }[]
  emailEnviadoA?: string | null
}