# Diseño — Mangos web

## Dirección

**Swiss**, en su lectura contemporánea: lienzo neutro, una sola familia
tipográfica, grilla de hairlines, jerarquía por tamaño y peso, y **un único
acento** (el azul Mangos). La tensión está en el contenido: una marca de fruta,
juguetona y brillante, resuelta con rigor editorial en lugar de con el dashboard
SaaS genérico de tarjetas flotantes y gradientes.

El objetivo del brief era "simple, funcional y moderno": Swiss es exactamente
eso, sin decoración que compita con los datos.

## Diferencial

**El folio del período.** El dashboard abre con una banda de hairlines donde el
período aparece como un folio grande en cifras tabulares (`noviembre de 2026`,
`11/2026`), separado del selector por una regla fina. Es el gesto que ordena la
pantalla y recuerda el origen editorial de la escuela suiza, sin dejar de ser
información real.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#F7F7F8` | fondo de la app |
| `--surface` | `#FFFFFF` | tarjetas, sidebar, inputs |
| `--ink` | `#111318` | texto principal |
| `--ink-2` | `#374151` | texto secundario |
| `--muted` | `#6B7280` | etiquetas y metadatos |
| `--line` | `#E5E7EB` | hairlines de estructura |
| `--accent` | `#00A3E8` | acento único: acciones, foco, gráfico |
| `--accent-dark` | `#0079AD` | hover y texto de acento |
| `--danger` / `--success` | `#D92D20` / `#067647` | semántica de error / éxito |

Tipografía: **una sola familia**, `"Helvetica Neue", Helvetica, Arial,
system-ui, sans-serif`, con `font-variant-numeric: tabular-nums` en cifras.
Radios 12/8 px, bordes de 1 px, sombra de tarjeta apenas perceptible
(`0 1px 2px rgb(16 24 40 / 4%)`). Nada de sombras duras, bordes punteados ni
mezcla de serif/mono.

## Contenido

- Cada string nombra información real: período, total, cantidad de gastos,
  categorías, topes, estado del presupuesto.
- Sin datos inventados ni telemetría decorativa.
- Copy estándar para acciones estándar: "Entrar", "Crear cuenta", "Guardar
  cambios", "Eliminar", "Salir".
- Los estados vacíos explican qué falta y ofrecen la acción siguiente.
- Los íconos del sidebar son SVG reales; no se usan glifos Unicode como íconos.

## Accesibilidad y respuesta

- Foco visible (`outline` azul) en todos los controles.
- Labels asociados en formularios; `role="alert"` en errores y `role="status"`
  en cargas.
- Contraste alto: texto `#111318` sobre blanco y `#FFFFFF` sobre azul.
- Sidebar que colapsa a barra superior por debajo de 980 px; grilla de widgets a
  una columna por debajo de 900 px.

## Movimiento

- **Reordenamiento sortable**: `dnd-kit` con `rectSortingStrategy`. Al sostener
  y arrastrar un widget, el resto se desplaza en vivo con transiciones; mouse
  con umbral de 6 px y touch con long-press de 180 ms. El elemento activo se
  dibuja en un `DragOverlay` (no se deforma con el reflujo) y su celda queda como
  placeholder atenuado. Los botones ←/→ quedan como alternativa accesible.
- **Redimensionado por esquina**: handle en la esquina inferior derecha;
  arrastrando se ajusta el ancho entre 3 y 12 columnas, con flechas del teclado
  como alternativa. Reemplaza al botón de tamaño.
- Entrada de widgets con `aparecer` (300 ms, 8 px de desplazamiento) y retardo
  escalonado de 40 ms por posición.
- Barras de categoría y presupuestos crecen con `scaleX` (560 ms); las barras
  del gráfico crecen con `scaleY` desde la base, escalonadas por punto.
- Modales y tarjeta de login con `modal-entrada` (220–320 ms) y fondo con
  `fundido` (160 ms).
- Botones, tarjetas, navegación e inputs con transiciones de 120–180 ms.
- Respeto de `prefers-reduced-motion`: todas las animaciones y transiciones se
  reducen a ~0 cuando el sistema lo pide.
