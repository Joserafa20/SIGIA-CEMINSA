# ROADMAP — SIGIA-CEMINSA

## Visión General

Sistema Integral de Gestión de Inventarios y Activos Institucionales para ESE CEMINSA.  
Desarrollo autónomo por fases con verificación de criterios de aceptación antes de avanzar.

---

## Fase 0 — Auditoría y Descubrimiento ✅
**Estado**: Completada · **Fecha**: 2026-11-13

- [x] Inspección de repositorio local
- [x] Análisis de los tres archivos Excel de inventario
- [x] Identificación de estructura de columnas por módulo
- [x] Mapeo de sedes institucionales (11 sedes confirmadas)
- [x] Inventario de riesgos de datos
- [x] Decisiones institucionales pendientes identificadas
- [x] Estructura de repositorio creada
- [x] .gitignore con protección de datos sensibles
- [x] Documentación de diagnóstico

---

## Fase 1 — SDD y Arquitectura 🔄
**Estado**: En progreso · **Fecha estimada**: 2026-11-13

- [ ] Modelo de datos relacional (Prisma schema completo)
- [ ] Diagrama entidad-relación
- [ ] Roles y permisos (RBAC detallado)
- [ ] API contracts por módulo (OpenAPI/Swagger)
- [ ] Historias de usuario (mínimo 30)
- [ ] Criterios de aceptación por historia
- [ ] Reglas de negocio formalizadas
- [ ] Decisiones técnicas documentadas (DECISION_LOG)
- [ ] Arquitectura de capas documentada

---

## Fase 2 — Infraestructura y Seguridad ⏳
**Fecha estimada**: TBD

- [ ] Monorepo configurado (pnpm workspaces)
- [ ] docker-compose.yml funcional (PostgreSQL, MinIO, Redis si aplica)
- [ ] NestJS bootstrap con módulos base
- [ ] Prisma conectado a PostgreSQL
- [ ] JWT + Refresh tokens
- [ ] RBAC implementado (Guards)
- [ ] Audit log middleware
- [ ] Swagger configurado y documentado
- [ ] Next.js con rutas protegidas
- [ ] Pruebas de autenticación

---

## Fase 3 — Módulo Almacén ⏳
**Fecha estimada**: TBD

- [ ] CRUD de activos/bienes
- [ ] Categorías y tipos (catálogo)
- [ ] Gestión de sedes
- [ ] Entradas por compra
- [ ] Salidas autorizadas
- [ ] Solicitudes de elementos
- [ ] Transferencias entre sedes (con estados: despachado/tránsito/recibido)
- [ ] Kardex
- [ ] Ajustes auditados
- [ ] Bajas (con aprobación)
- [ ] Importador desde Excel
- [ ] Reportes PDF y Excel
- [ ] Pruebas unitarias e integración

---

## Fase 4 — Módulo Sistemas ⏳
**Fecha estimada**: TBD

- [ ] CRUD de activos tecnológicos
- [ ] Hoja de vida por equipo (serial, specs, garantía)
- [ ] Asignación a funcionarios
- [ ] Ubicaciones
- [ ] Mantenimientos preventivos y correctivos
- [ ] Historial técnico
- [ ] Mesa de ayuda / Tickets
- [ ] Integración con Almacén (transferencia de equipos)
- [ ] Generación de códigos QR
- [ ] Importador desde Excel
- [ ] Pruebas

---

## Fase 5 — Módulo Farmacia ⏳
**Fecha estimada**: TBD

- [ ] CRUD de productos (medicamentos, dispositivos, reactivos)
- [ ] Gestión de lotes y vencimientos
- [ ] Registro INVIMA
- [ ] Existencias por sede
- [ ] Entradas y salidas
- [ ] Método FEFO
- [ ] Alertas de vencimiento
- [ ] Productos vencidos y cuarentena
- [ ] Control de cadena de frío
- [ ] Bloqueo de dispensación de vencidos
- [ ] Kardex farmacéutico
- [ ] Importador desde Excel
- [ ] Pruebas

---

## Fase 6 — Integración, Reportes y Offline ⏳
**Fecha estimada**: TBD

- [ ] Dashboard principal con indicadores
- [ ] Reportes consolidados multi-módulo
- [ ] Exportación PDF y Excel
- [ ] Adjuntos de documentos (MinIO)
- [ ] PWA con service worker
- [ ] Sincronización offline controlada
- [ ] Manejo de conflictos de sincronización

---

## Fase 7 — QA y Auditoría ⏳
**Fecha estimada**: TBD

- [ ] Cobertura de pruebas unitarias ≥ 80% en lógica crítica
- [ ] Pruebas de integración completas
- [ ] Pruebas E2E con Playwright
- [ ] Pruebas de permisos por rol
- [ ] Pruebas de seguridad básicas
- [ ] Pruebas de concurrencia
- [ ] Validación de reglas de negocio (no negativos, no vencidos, etc.)
- [ ] Reporte de cobertura

---

## Fase 8 — Documentación y Entrega ⏳
**Fecha estimada**: TBD

- [ ] Manual de usuario (por módulo y rol)
- [ ] Manual de implementación
- [ ] Manual de administración
- [ ] SDD actualizado
- [ ] Instrucciones de despliegue
- [ ] Informe final de entrega
- [ ] Informe ejecutivo
