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
- Sidebar que colapsa a barra superior por debajo de 980 px; la grilla de
  widgets pasa a una columna en el mismo punto (980 px) y restaura el layout de
  escritorio al volver.

## Movimiento

- **Tablero GridStack**: `gridstack` v14 maneja drag & drop, resize, colisiones y
  compactación con `animate: true`; al mover o soltar, las tarjetas se reacomodan
  con una transición de ~300 ms.
- **Arrastre**: solo el agarre de la tarjeta (`.widget__drag`) inicia el drag;
  botones, inputs y enlaces no lo disparan. En touch GridStack usa su long-press
  nativo y muestra el handle de resize.
- **Resize**: handle nativo de la esquina inferior derecha; el ancho se ajusta
  entre 3 y 12 columnas y la altura en filas de 54 px.
- **Mobile**: por debajo de 980 px la grilla pasa a una columna; al volver a
  escritorio se restaura el layout guardado.
- Barras de categoría y presupuestos crecen con `scaleX` (560 ms); las barras
  del gráfico crecen con `scaleY` desde la base, escalonadas por punto.
- Modales y tarjeta de login con `modal-entrada` (220–320 ms) y fondo con
  `fundido` (160 ms).
- Botones, tarjetas, navegación e inputs con transiciones de 120–180 ms.
- Respeto de `prefers-reduced-motion`: todas las animaciones y transiciones se
  reducen a ~0 cuando el sistema lo pide.

## Tablero

El tablero usa **GridStack** con 12 columnas en escritorio y 1 en mobile. Cada
widget es una tarjeta arrastrable por su agarre y redimensionable desde la
esquina inferior derecha; GridStack resuelve colisiones, compacta hacia arriba
(`mode: 'top'`) y anima el reacomodo. Al agregar una instancia se busca el primer
hueco libre. El layout completo (`x`, `y`, `w`, `h`) se persiste por usuario en
`localStorage` y se migra automáticamente del formato anterior basado en `span`.

**Modo edición:** fuera de él, los widgets son de solo lectura (no se arrastran
ni redimensionan y no muestran controles). El botón “Editar” habilita el arrastre,
el handle de resize y las acciones de agregar/restablecer; “Listo” vuelve a la
vista limpia.
