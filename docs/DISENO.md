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

**El tablero por widget.** Cada tarjeta de total, categorías y evolución tiene
su propio selector de período (Hoy, esta semana, este mes, mes anterior,
últimos 15 días, últimos 3 meses o este año). El dashboard abre con una cabecera
simple —título “Dashboard” y acciones— y deja que los datos manden. Las pantallas
de Gastos, Categorías, Presupuestos y Perfil comparten la misma cabecera con
título y acción principal a la derecha.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#F7F7F8` | fondo de la app |
| `--surface` | `#FFFFFF` | tarjetas, sidebar, inputs |
| `--ink` | `#111318` | texto principal |
| `--ink-2` | `#374151` | texto secundario |
| `--muted` | `#6B7280` | etiquetas y metadatos |
| `--line` | `#E5E7EB` | hairlines de estructura |
| `--accent` | `#00A3E8` | acento principal: acciones y foco; los gráficos suman una paleta de apoyo |
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
- Las categorías del sistema son de solo lectura: no muestran acciones de
  renombrar ni eliminar. Las creadas por el usuario sí.
- El listado de gastos filtra por período (desde/hasta), categoría y rango de
  monto (mínimo/máximo).
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
- **Arrastre**: se toma desde el encabezado de la tarjeta, así el área para
  agarrar es amplia; botones, inputs y enlaces no disparan el drag. En touch
  GridStack usa su long-press nativo y muestra el handle de resize.
- **Resize**: handle nativo de la esquina inferior derecha. Cada tipo de widget
  define su mínimo legible (4–6 columnas y 4–6 filas) para evitar que el
  contenido se corte; el máximo es 12 columnas. Las filas miden 54 px.
- **Mobile**: por debajo de 980 px la grilla pasa a una columna; al volver a
  escritorio se restaura el layout guardado.
- Barras de categoría y presupuestos crecen con `scaleX` (560 ms); las barras
  del gráfico crecen con `scaleY` desde la base, escalonadas por punto.
- Modales y tarjeta de login con `modal-entrada` (220–320 ms) y fondo con
  `fundido` (160 ms).
- Botones, tarjetas, navegación e inputs con transiciones de 120–180 ms.
- Respeto de `prefers-reduced-motion`: todas las animaciones y transiciones se
  reducen a ~0 cuando el sistema lo pide.

## Cabeceras

Todas las pantallas de la app (Dashboard, Gastos, Categorías, Presupuestos,
Perfil y 404) abren con la misma cabecera: título grande a la izquierda, acción
principal a la derecha y una hairline inferior. En el dashboard, “Restablecer”
queda junto al título y las acciones de edición se alinean a la derecha.

## Tablero

El tablero usa **GridStack** con 12 columnas en escritorio y 1 en mobile. Cada
widget es una tarjeta arrastrable desde su encabezado y redimensionable desde la
esquina inferior derecha; GridStack resuelve colisiones, compacta hacia arriba
(`mode: 'top'`) y anima el reacomodo. Al agregar una instancia se busca el primer
hueco libre. El layout completo (`x`, `y`, `w`, `h`) se persiste por usuario en
`localStorage` y se migra automáticamente del formato anterior basado en `span`.
Cada tipo define un mínimo de ancho/alto para que el contenido siga siendo
legible al achicarlo; el historial usa 8×8 para que entren sus cinco filas y la
paginación sin scroll. No hay selector global en la cabecera: total, categorías y
evolución tienen un selector compacto de período en su encabezado (hoy, esta
semana, este mes, mes anterior, últimos 15 días, últimos 3 meses o este año);
presupuestos e historial usan el mes actual. Los gráficos de categorías y
evolución usan una paleta de colores por categoría y por punto de la serie. El
gráfico de evolución ocupa el alto disponible y no crece al ensanchar el widget. El picker de widgets muestra una confirmación visual
(“Agregado correctamente” y el botón en verde) durante 5 segundos al sumar una
instancia. “Restablecer” abre un diálogo con “Cancelar” y “Restablecer” (sin un
segundo botón de cierre) antes de descartar el layout personalizado. Los modales
quedan por encima de los handles de resize de GridStack.

**Modo edición:** fuera de él, los widgets son de solo lectura (no se arrastran
ni redimensionan y no muestran controles). El botón “Editar” habilita el arrastre,
el handle de resize y las acciones de agregar/restablecer; “Listo” vuelve a la
vista limpia.
