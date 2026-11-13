# Tasks — SIGIA-CEMINSA

## Fase 1 — SDD y Arquitectura (ACTIVA)

- [ ] Prisma schema completo (todos los modelos)
- [ ] docker-compose.yml (PostgreSQL, MinIO)
- [ ] .env.example
- [ ] pnpm workspace root package.json
- [ ] Bootstrap NestJS (apps/backend)
- [ ] Bootstrap Next.js (apps/frontend)
- [ ] Autenticación JWT + Refresh tokens (backend)
- [ ] RBAC Guards (backend)
- [ ] Audit log middleware
- [ ] Swagger setup
- [ ] Diagrama ER
- [ ] API contracts documentados

## Fase 2 — Infraestructura

- [ ] Docker Compose funcional con healthchecks
- [ ] Prisma migrations iniciales
- [ ] Seeds de datos de prueba anonimizados
- [ ] Endpoints de autenticación con pruebas
- [ ] Middleware de auditoría con pruebas

## Fase 3 — Módulo Almacén

- [ ] Entidades: Asset, AssetCategory, AssetType, AssetMovement
- [ ] Entidades: Sede, StockEntry, StockExit, Transfer
- [ ] API: CRUD activos
- [ ] API: Entradas y salidas
- [ ] API: Transferencias (despacho → tránsito → recepción)
- [ ] API: Kardex
- [ ] API: Ajustes auditados
- [ ] API: Bajas con aprobación
- [ ] Script importador desde Excel
- [ ] UI: Listado de activos con filtros
- [ ] UI: Formularios validados
- [ ] UI: Kardex
- [ ] UI: Reportes PDF/Excel
- [ ] Pruebas unitarias
- [ ] Pruebas de integración

## Fase 4 — Módulo Sistemas
(Ver ROADMAP.md)

## Fase 5 — Módulo Farmacia
(Ver ROADMAP.md)
