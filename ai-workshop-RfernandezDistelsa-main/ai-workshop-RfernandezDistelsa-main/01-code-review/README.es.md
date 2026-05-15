# Ejercicio 1 — Revisión de código en una API heredada de librería

## Escenario

Has heredado un pequeño servicio de TypeScript + Express. El ingeniero anterior se tomó un sabático
y no hay documento de diseño — solo el código, una prueba delgada, y un vago "funciona en dev." El producto
quiere enviarlo el próximo sprint.

En este ejercicio ejecutarás **dos revisiones del mismo código base** usando dos enfoques diferentes,
luego compararás los resultados lado a lado.

## Stack

- Node 20+, TypeScript (strict), Express 4
- Vitest para pruebas, ESLint con una configuración deliberadamente laxa
- Endpoints: `GET /books`, `GET /books/:id`, `POST /books`, `PATCH /books/:id`,
  `DELETE /books/:id`, `GET /authors/:id/books`, `POST /auth/login`, `GET /auth/me`

## Configuración

```bash
npm install
npm test       # debería ser verde (3 pruebas)
```

Abre Claude Code en este directorio antes de cada ejecución:

```bash
claude
```

## Cómo funciona este ejercicio

Ejecutarás la misma solicitud de revisión dos veces con diferentes estrategias de delegación:

- **Ejecución 1** — Revisión de una sola pasada con delegación bloqueada explícitamente
- **Ejecución 2** — Revisión abierta que permite al sistema delegar según los agentes disponibles

Objetivo: observar cómo el enfoque afecta los hallazgos.

---

## Ejecución 1 — Revisión de una sola pasada (sin delegación)

Un único prompt pidiendo a Claude que lo haga todo. La restricción clave es la última línea —
sin ella, Claude delegaría automáticamente al equipo de revisión según las instrucciones del repositorio.

**Prompt a usar (copia y pega tal cual):**

```
I inherited this Express API and need to ship it next sprint.
Review the code in src/ thoroughly.
Write findings to findings-direct.md, grouped by severity with file and line references.
Do not delegate this review to any subagents — conduct the entire analysis yourself.
```

Espera a que termine, luego abre `findings-direct.md`.

## Ejecución 2 — Revisión abierta (delegación implícita)

La misma tarea, pero sin la instrucción explícita de "no delegar". Según el `CLAUDE.md` del repositorio,
el sistema delegará en agentes especializados disponibles si coinciden con la tarea.

**Prompt a usar (copia y pega tal cual):**

```
I inherited this Express API and need to ship it next sprint.
Review the code in src/ thoroughly.
Write findings to findings-agents.md, grouped by severity with file and line references.
```

Observa cómo lo maneja el sistema, luego abre `findings-agents.md`.

## Comparando los dos informes

Ahora tienes dos informes. Compáralos y anota tus observaciones.

```bash
diff findings-direct.md findings-agents.md
```

O ábrelos lado a lado en el editor.

Mientras los revisas, fíjate en lo que notas sobre la claridad, el alcance y la utilidad de cada informe.
