# Decision Log — SIGIA-CEMINSA

Registro de decisiones técnicas y arquitectónicas tomadas durante el desarrollo.

---

## DEC-001: Stack tecnológico principal
**Fecha**: 2026-11-13 | **Estado**: Aprobado

**Decisión**: Next.js 14 (frontend) + NestJS (backend) + PostgreSQL + Prisma + Docker Compose

**Alternativas consideradas**:
- Express.js en lugar de NestJS: descartado por falta de estructura para proyecto de esta escala
- MySQL en lugar de PostgreSQL: descartado; PostgreSQL tiene mejor soporte para JSON, transacciones y extensiones

**Justificación**: Stack con soporte empresarial, TypeScript end-to-end, ORM con migraciones auditables.

---

## DEC-002: Monorepo con pnpm workspaces
**Fecha**: 2026-11-13 | **Estado**: Aprobado

**Decisión**: Un único repositorio Git con `apps/frontend`, `apps/backend`, `packages/database`

**Justificación**: Facilita compartir tipos TypeScript entre frontend y backend, simplifica CI/CD y versioning.

---

## DEC-003: Protección de datos institucionales
**Fecha**: 2026-11-13 | **Estado**: Aprobado

**Decisión**: Los archivos Excel de inventario (`insumos/*.xlsx`) NO se suben al repositorio (en `.gitignore`)

**Justificación**: El repositorio es público. Los Excel contienen inventarios institucionales, valores patrimoniales, seriales y nombres de funcionarios. Publicarlos representa riesgo de seguridad institucional.

**Acción**: Se crearán datos de prueba anonimizados en `packages/database/seeds/` para desarrollo.

---

## DEC-004: Modelo de activos en almacén
**Fecha**: 2026-11-13 | **Estado**: Propuesto (pendiente validación institucional)

**Decisión**: Un activo institucional tiene una única identidad (`Asset`) en la base de datos. Cuando Almacén transfiere un equipo tecnológico a Sistemas, se crea un registro `TechAsset` vinculado al `Asset` original — no se duplica el activo.

**Justificación**: Los Excel muestran que el mismo bien aparece en ambos módulos. La integridad patrimonial requiere un único registro con visibilidad dual.

---

## DEC-005: Estado del activo como enum
**Fecha**: 2026-11-13 | **Estado**: Aprobado

**Decisión**: El estado físico del activo se modela como enum `{ EXCELENTE, BUENO, REGULAR, MALO, BAJA }` en lugar de las tres columnas B/R/M del Excel.

**Justificación**: Normalización de datos. El Excel usa tres columnas separadas con marca "X" — antipatrón.

---

## DEC-006: Redis
**Fecha**: 2026-11-13 | **Estado**: Diferido

**Decisión**: Redis NO se incluye en la infraestructura inicial. Se evaluará si existe necesidad real (colas, sesiones, cache) durante la Fase 2.

**Justificación**: El prompt indica "únicamente si existe necesidad técnica justificada".

---

## DEC-007: Farmacia — modelo de datos horizontal
**Fecha**: 2026-11-13 | **Estado**: Propuesto

**Decisión**: El Excel de farmacia usa 657 columnas (modelo horizontal por periodo/sede). Se debe transformar a modelo relacional normalizado: `Product → Lot → StockMovement` por sede.

**Acción pendiente**: Diseñar script ETL para importar los 223 registros actuales respetando lotes y vencimientos.

---

## DECISIONES INSTITUCIONALES PENDIENTES

Estas decisiones NO pueden tomarse técnicamente. Requieren validación formal de la ESE CEMINSA:

| ID | Decisión | Responsable sugerido |
|----|----------|---------------------|
| INST-001 | Nombres y códigos oficiales de sedes | Gerencia / Talento Humano |
| INST-002 | Responsables formales de cada módulo | Gerencia |
| INST-003 | Montos y reglas de autorización de compras | Gerencia / Jurídica |
| INST-004 | Criterios y procedimiento de baja de bienes | Comité de bienes / Contabilidad |
| INST-005 | Listado de medicamentos con cadena de frío | Farmacia / Regente |
| INST-006 | Medicamentos sin requisito de lote | Farmacia / Regente |
| INST-007 | Integración con sistema contable (si aplica) | Contabilidad / Gerencia |
| INST-008 | Accesos de Control Interno y Contabilidad | Gerencia / TIC |
