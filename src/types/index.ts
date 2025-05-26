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
