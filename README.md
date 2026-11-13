# SIGIA-CEMINSA

**Sistema Integral de Gestión de Inventarios y Activos Institucionales**  
ESE Centro Materno Infantil de Sabanalarga — CEMINSA

---

## Estado del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Base: monorepo, BD, autenticación JWT, RBAC | ✅ Completada |
| Fase 2 | Infraestructura: Docker, variables de entorno, CI base | ✅ Completada |
| Fase 3 | Módulo Almacén — activos, categorías, movimientos, traslados | ✅ Completada |
| Fase 4 | Módulo Sistemas TIC — equipos, tickets, mantenimientos, licencias | ✅ Completada |
| Fase 5 | Módulo Farmacia — productos, lotes (FEFO), stock, dispensación | ✅ Completada |
| Fase 6 | Dashboard real, reportes Excel/PDF, PWA | ✅ Completada |
| Fase 7 | QA — 51 tests unitarios, E2E Playwright, GitHub Actions CI | ✅ Completada |
| Fase 8 | Documentación, guía de setup, Swagger completo | ✅ Completada |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 10 + TypeScript |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Base de datos | PostgreSQL 16 + Prisma ORM |
| Autenticación | JWT (access 15 min + refresh 7 días) + argon2 |
| Almacenamiento de archivos | MinIO (S3-compatible) |
| Contenedores | Docker Compose |
| Testing | Jest + Testing Library + Playwright |
| CI/CD | GitHub Actions |

---

## Estructura del repositorio

```
SIGIA-CEMINSA/
├── apps/
│   ├── backend/          # API NestJS — puerto 3001
│   └── frontend/         # Next.js — puerto 3000
├── packages/
│   └── database/         # Prisma schema + cliente generado
├── docs/                 # Documentación técnica y de usuario
├── docker-compose.yml    # PostgreSQL + MinIO
└── package.json          # pnpm workspaces raíz
```

---

## Inicio rápido

Ver [docs/SETUP.md](docs/SETUP.md) para la guía completa de instalación.

```bash
# 1. Clonar y dependencias
git clone https://github.com/Joserafa20/SIGIA-CEMINSA.git
cd SIGIA-CEMINSA
pnpm install

# 2. Levantar servicios (PostgreSQL + MinIO)
docker compose up -d

# 3. Variables de entorno
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env con tus valores

# 4. Migrar base de datos + seed inicial
cd packages/database && npx prisma migrate deploy
cd apps/backend && npx ts-node src/seed.ts

# 5. Iniciar en desarrollo
pnpm dev
```

Aplicación disponible en:
- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

---

## Módulos del sistema

### Almacén
Gestión de activos fijos institucionales (mobiliario, equipos, vehículos).
- Inventario con categorías y estados (`BUENO`, `REGULAR`, `MALO`, `EN_MANTENIMIENTO`, `BAJA`)
- Movimientos de entrada/salida con trazabilidad completa
- Traslados entre sedes con ciclo de vida (`DESPACHADO → RECIBIDO | CANCELADO`)
- Reporte Excel de inventario

### Farmacia
Control de medicamentos e insumos con lógica FEFO.
- Catálogo de productos con stock mínimo configurable
- Lotes con fecha de vencimiento y cuarentena
- **Dispensación FEFO**: consume automáticamente el lote de menor fecha de vencimiento
- Alertas de stock bajo y lotes próximos a vencer
- Reporte Excel de stock y lotes

### Sistemas TIC
Gestión de equipos tecnológicos, soporte y mantenimiento.
- Inventario de equipos con historial de mantenimientos
- Tickets de soporte con estado (`ABIERTO → EN_PROGRESO → RESUELTO → CERRADO`)
- Mantenimientos preventivos y correctivos
- Control de licencias de software con alertas de vencimiento

### Dashboard y Reportes
- KPIs en tiempo real de los tres módulos
- Generación de reportes: Almacén (XLSX), Farmacia (XLSX), Ejecutivo (PDF)
- PWA: instalable en dispositivos móviles con modo offline

---

## API REST

La documentación interactiva está disponible en Swagger UI una vez levantado el backend:

```
http://localhost:3001/api/docs
```

Todos los endpoints están bajo `/api/v1/` y requieren token JWT excepto `POST /api/v1/auth/login`.

### Autenticación

```bash
# Login
POST /api/v1/auth/login
{ "email": "admin@ceminsa.gov.co", "password": "Admin1234!" }

# Respuesta
{ "accessToken": "...", "refreshToken": "..." }

# Usar en requests
Authorization: Bearer <accessToken>
```

---

## Testing

```bash
# Backend — tests unitarios con cobertura
cd apps/backend && pnpm test:cov

# Frontend — tests de componentes
cd apps/frontend && pnpm test

# E2E (requiere app corriendo)
cd apps/frontend && pnpm test:e2e
```

**Cobertura actual**: 51 tests unitarios cubriendo los servicios de negocio críticos (FEFO, state machines de tickets y traslados, auth, dashboard).

---

## Seguridad

- Contraseñas con argon2 (nunca MD5/bcrypt)
- JWT de corta duración (15 min) + refresh de 7 días
- RBAC: roles por usuario y acceso restringido por sede
- Throttling en endpoints de autenticación
- Validación de DTOs con `class-validator` (whitelist + forbidNonWhitelisted)
- **Stock negativo bloqueado** a nivel de servicio antes de cada transacción
- **Movimientos confirmados**: no se eliminan físicamente, solo se anulan con trazabilidad
- Auditoría inmutable en todas las operaciones críticas

---

## Licencia

Uso exclusivo de ESE CEMINSA — Sabanalarga, Atlántico, Colombia.
