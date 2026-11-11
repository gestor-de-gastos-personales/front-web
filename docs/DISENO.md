# Diseño — Mangos web

## Dirección

**Brutalist**, anclado en la paleta plana del logo de Mangos. La tensión es la
deliberada: una herramienta de finanzas personales, normalmente prolija y
neutra, se resuelve con primarios planos, bordes duros y tipografía de sistema.
El logo ya es vectorial, brillante y sin gradientes; la interfaz lo continúa en
lugar de suavizarlo.

Se descartaron las opciones "seguras" (Swiss neutro, dashboard SaaS con tarjetas
redondeadas) porque diluían la marca y producían una pantalla genérica.

## Diferencial

**Widgets como recibos**: cada bloque del dashboard es un ticket con el borde
superior perforado (`border-top: 8px dotted`), borde negro de 2 px y sombra
offset de 8 px. El período se muestra como un folio en serif grande, y los
totales usan cifras tabulares en Times. La metáfora viene del dominio: la app
procesa comprobantes de gastos.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--mangos-blue` | `#00A3E8` | superficie de la app |
| `--mango` | `#FFA726` | acento primario, botones, barras |
| `--mango-light` | `#FFD18A` | brillo del logo |
| `--coral` | `#FF4D4D` | errores, acciones destructivas, excedidos |
| `--leaf` | `#2FBF71` | presupuestos en rango, hoja del logo |
| `--stem` | `#8B4513` | tallo del logo |
| `--ink` | `#000000` | texto, bordes, sombras |
| `--paper` | `#FFFFFF` | tarjetas |

Tipografía: **tres registros de sistema**, mezclados a propósito.

- UI: `Helvetica, Arial, sans-serif`
- Etiquetas y metadatos: `"Courier New", monospace`, mayúsculas y tracking
- Cifras grandes y folio: `"Times New Roman", serif`, con `tabular-nums`

Estructura: grilla de 12 columnas, bordes de 2 px, sombras duras sin blur,
radios de 0 px, controles nativos (`select`, `input type=date`, `button`).

## Contenido

- Todos los strings nombran información real: período, total, cantidad de
  gastos, categorías, topes.
- No hay datos inventados, telemetría falsa, kickers `//` ni íconos Unicode
  usados como reemplazo.
- Los estados vacíos explican qué falta y ofrecen la acción siguiente.
- El copy de acciones estándar es estándar: "Entrar", "Crear cuenta",
  "Guardar cambios", "Eliminar", "Salir".

## Accesibilidad y respuesta

- Foco visible por defecto del navegador; labels asociados en todos los campos.
- Contraste alto (negro sobre blanco/azul; texto blanco solo sobre azul oscuro).
- `role="alert"` en errores, `role="status"` en cargas, `aria-label` en botones
  de acción de tabla y en el gráfico.
- Grilla que colapsa a una columna por debajo de 900 px.
