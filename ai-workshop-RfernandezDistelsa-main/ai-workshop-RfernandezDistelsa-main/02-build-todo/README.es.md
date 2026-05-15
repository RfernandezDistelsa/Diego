# Ejercicio 2 — Extender y rediseñar Tasky

## Escenario

Tasky es una aplicación de tareas funcional con tareas, niveles de prioridad, filtros y deshacer. Tu trabajo es extenderla con una nueva característica y darle un nuevo aspecto — usando un equipo de agentes especializados para hacer el trabajo.

Los agentes conocen el flujo de trabajo. Solo diles qué quieres.

## Stack

- Next.js 16 (App Router), TypeScript strict mode
- Tailwind CSS v3 para estilos
- Vitest + Testing Library para pruebas

## Configuración

```bash
npm install
npm test         # debería ser verde antes de comenzar (8 pruebas)
npm run dev      # http://localhost:3000 (para probar tu característica)
```

Abre Claude Code en este directorio:

```bash
claude
```

---

## Agentes disponibles

Tu equipo de construcción consta de estos agentes especializados. Los invocas con el comando `/agents` o escribiendo `@mention`:

- **`@pm-spec`** — Toma un resumen de característica y escribe una especificación ajustada: lista de características, criterios de aceptación, modelo de datos, contrato de API, cortes de alcance
- **`@architect`** — Toma una especificación y diseña el código: estructura de carpetas, abstracciones clave, opciones técnicas, ADRs
- **`@backend-dev`** — Implementa la capa no-UI desde un documento de arquitectura: lógica empresarial, rutas de API, persistencia (localStorage)
- **`@frontend-dev`** — Implementa la capa de UI desde un documento de arquitectura: componentes React, páginas, estado, estilos Tailwind
- **`@qa-engineer`** — Ejecuta pruebas e informa paso/fallo por archivo de prueba; lista defectos con suficiente detalle para arreglarlo
- **`@ux-designer`** — Crea especificaciones de diseño visual desde un resumen: paleta de colores, tipografía, cambios de clases Tailwind por componente

**Cómo invocar un agente:**
- Escribe `/agents` para listar agentes disponibles en este proyecto
- En un prompt, usa `@agent-name` para mencionar explícitamente un agente (p. ej., `Use @pm-spec to...`)
- **Los agentes se seleccionan automáticamente según sus descripciones** — si describes lo que necesitas (p. ej., "Necesito una especificación"), Claude Code selecciona automáticamente el agente coincidente sin requerir la mención `@`
- Cada agente se ejecuta en su propia ventana de contexto y devuelve solo un resumen al hilo principal, manteniendo tu contexto principal pequeño

Estos agentes conocen el flujo de trabajo. Diles qué quieres y se coordinarán.

---

## Paso 1 — Agregar una característica

Elige una característica del menú y descríbela. Los agentes clarificarán el alcance contigo, luego planificarán y la construirán.

**Menú de características** (la prioridad ya está construida — elige algo nuevo):
- **Fechas de vencimiento** — las tareas pueden tener una fecha de vencimiento opcional; las tareas vencidas se resaltan
- **Etiquetas** — las tareas pueden tener etiquetas de forma libre; filtra la lista por etiqueta
- **Buscar** — filtro de texto en vivo entre títulos de tareas
- **Tareas recurrentes** — tareas que se reinician en un cronograma

**Prompt a usar:**

```
I want to add a new feature to Tasky: <feature name and one-sentence description>
```

El orquestador hará algunas preguntas aclaratorias, luego delegará al equipo de construcción automáticamente.

---

## Paso 2 — Rediseñar con el diseñador UX

Un agente `@ux-designer` está disponible. Úsalo para crear una especificación de diseño desde una descripción visual.

**Cómo funciona:**
1. Describe tu dirección visual en una oración
2. Usa `@ux-designer` para crear una especificación de diseño (`docs/design-spec.md`)
3. Usa `@frontend-dev` para implementar la especificación

**Ejemplos de direcciones:**
- "Dark and minimal — charcoal background, monospace font, muted green accents"
- "Bright and playful — white background, bold colors, rounded pill buttons"
- "Enterprise dashboard — neutral greys, compact density, blue primary actions"

**Prompt a usar:**

```
I want to redesign Tasky. Here's my direction: <your one-sentence brief>
```

---

## Entregable

Al final de la sesión:

- `npm test` es verde
- `npm run build` tiene éxito
- Puedes demostrar el camino dorado en 60 segundos con tu nueva característica y diseño en vivo
- Tienes un agente `ux-designer` funcional que escribiste
