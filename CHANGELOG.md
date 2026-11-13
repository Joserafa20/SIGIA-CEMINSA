# Changelog — SIGIA-CEMINSA

Todos los cambios notables se documentan aquí.

## [Unreleased] — develop

### Added
- Estructura inicial del repositorio
- `.gitignore` con protección de datos sensibles institucionales
- `README.md` con estado del proyecto y stack tecnológico
- `ROADMAP.md` con todas las fases y criterios
- `DECISION_LOG.md` con decisiones técnicas y pendientes institucionales
- `SESSION.md` para continuidad entre sesiones
- `TASKS.md` con lista de tareas activas
- `QUALITY_GATE.md` con criterios de calidad no negociables
- `docs/diagnostico/FASE_0_AUDITORIA.md` — análisis completo de los Excel de inventario
- Directorios: `apps/frontend/`, `apps/backend/`, `packages/database/`, `docs/`, `scripts/`

### Notes
- Los archivos Excel de inventario (`insumos/*.xlsx`) se mantienen exclusivamente en local
- 11 sedes institucionales confirmadas en los datos
- ~2.044 registros de activos en almacén listos para importación futura
- 223 medicamentos en farmacia (requieren transformación ETL)
- 92 equipos en sistemas (requieren enriquecimiento de datos)
