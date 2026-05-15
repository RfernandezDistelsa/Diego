# Taller · Orquestación de agentes con OpenCode

Un taller práctico sobre el uso de subagentes especializados para hacer trabajo de ingeniería real — revisión de código,
escritura de especificaciones, arquitectura, implementación y pruebas — manteniendo el contexto principal pequeño.

Tiempo total: **~1.5 horas**.

## Configuración

Abre el repositorio en un GitHub Codespace. Espera a que termine el script de post-creación (~90s), luego inicia OpenCode:

```bash
claude --version
```

| | OpenCode | Claude Code (alternativa) |
|---|---|---|
| Lanzar | `opencode` | `claude` |
| Ruta de agentes | `.opencode/agent/` | `.claude/agents/` |

## Conceptos

- Un subagente se ejecuta en su propia ventana de contexto y devuelve solo un resumen al hilo principal.
- El hilo principal se mantiene pequeño; el trabajo ocurre en los sub-contextos.
- Los agentes se seleccionan automáticamente según su campo `description` — no se necesita etiquetado explícito.
- Patrones: **Review crew** (paralelo), **Build crew** (pipeline), **Refactor crew** (analizar → planificar → implementar → verificar).

Referencia: [`docs/workflow-patterns.md`](docs/workflow-patterns.md) · [`docs/AGENTS.md`](docs/AGENTS.md)

## Ejercicio 1 — Revisión de código (45 min)

Ver [`01-code-review/README.es.md`](01-code-review/README.es.md).

Dos ejecuciones del mismo código base — de una sola pasada (sin delegación) y abierta (delegación implícita) — ambas escribiendo en archivos para que puedas
comparar los resultados.

## Ejercicio 2 — Construir desde un PRD (45 min)

Ver [`02-build-todo/README.es.md`](02-build-todo/README.es.md).

Pipeline completo de build-crew: especificación → arquitectura → pruebas fallidas → implementación paralela →
verificación. Eres el humano en el bucle revisando la salida de cada agente antes de que se ejecute el siguiente paso.
