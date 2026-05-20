type EntornoEntrada = Record<string, string | undefined>;

const variablesObligatorias = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_STORAGE_BUCKET_IMAGENES_PRODUCTOS',
];

export function validarEntorno(configuracion: EntornoEntrada) {
  const faltantes = variablesObligatorias.filter(
    (variable) => !configuracion[variable],
  );

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${faltantes.join(', ')}`,
    );
  }

  return configuracion;
}
