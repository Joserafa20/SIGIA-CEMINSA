# Arquitectura — SIGIA-CEMINSA

---

## Visión general

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIGIA-CEMINSA                            │
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │   Next.js 14     │  HTTP    │      NestJS 10 API           │ │
│  │   App Router     │◄────────►│   /api/v1/...                │ │
│  │   Puerto 3000    │  JWT     │   Puerto 3001                │ │
│  └──────────────────┘          └──────────────┬───────────────┘ │
│                                               │                 │
│                                    ┌──────────┴──────────┐      │
│                                    │   PostgreSQL 16      │      │
│                                    │   Prisma ORM         │      │
│                                    └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monorepo

El proyecto usa **pnpm workspaces** con tres workspaces:

```
packages/database/   ← Schema Prisma + cliente generado (compartido)
apps/backend/        ← API NestJS
apps/frontend/       ← Interfaz Next.js
```

`packages/database` es el único lugar donde vive el schema de Prisma. Backend y frontend consumen el cliente generado desde `packages/database/generated/client`.

---

## Backend — NestJS

### Módulos

```
AppModule
├── AuthModule          → JWT, login, refresh, perfil
├── UsersModule         → CRUD usuarios, roles, acceso por sede
├── SedesModule         → Sedes/sucursales institucionales
├── AuditModule         → Log inmutable de operaciones críticas
├── AlmacenModule
│   ├── AssetsModule    → Activos fijos, estados
│   ├── CategoriesModule
│   ├── MovementsModule → Entradas/salidas de activos
│   └── TransfersModule → Traslados entre sedes (DESPACHADO→RECIBIDO)
├── SistemasModule
│   ├── TechAssetsModule → Equipos TIC
│   ├── TicketsModule    → Soporte (state machine)
│   ├── MaintenanceModule
│   └── LicensesModule
├── FarmaciaModule
│   ├── ProductsModule  → Catálogo de medicamentos
│   ├── LotsModule      → Lotes con fecha vencimiento y cuarentena
│   └── StockModule     → Motor FEFO, dispensación, ajustes
├── DashboardModule     → KPIs agregados por módulo
└── ReportsModule       → Generación Excel (ExcelJS) y PDF (pdfkit)
```

### Convenciones de API

- Prefijo global: `/api`
- Versionado URI: `/api/v1/`
- Autenticación: `Authorization: Bearer <jwt>`
- Paginación: `?page=1&limit=20`
- Respuestas de error: `{ statusCode, message, error }`

### Seguridad

```
Request → ThrottlerGuard → JwtAuthGuard → RolesGuard → Controller
```

- `JwtAuthGuard`: verifica el access token en cada request protegido
- `RolesGuard`: compara `@Roles()` del endpoint contra los roles del usuario
- `SUPER_ADMIN` bypasea `RolesGuard` automáticamente
- `AuditService.log()`: falla silenciosamente — nunca bloquea la operación de negocio

---

## Lógica de negocio crítica

### FEFO — Dispensación de Farmacia

El motor FEFO en `StockModule` consume lotes ordenados por `expiresAt ASC NULLS LAST`:

```
dispense(dto) →
  1. Verificar existencia y actividad del producto
  2. Verificar stock total suficiente (BadRequestException si no alcanza)
  3. Obtener lotes DISPONIBLE ORDER BY expiresAt ASC NULLS LAST
  4. Dentro de $transaction:
     - Iterar lotes hasta cubrir la cantidad solicitada
     - Lote agotado → status = AGOTADO
     - Decrementar ProductStock.quantity
     - Crear StockMovement SALIDA por cada lote consumido
  5. AuditService.log(DISPENSE_STOCK)
```

### State machines

**Tickets** (`sistemas/tickets`):
```
ABIERTO → EN_PROGRESO → RESUELTO → CERRADO
                      ↘          ↗
                       CANCELADO
```
Estados terminales `CERRADO` y `CANCELADO` protegidos con `ForbiddenException`.

**Traslados** (`almacen/transfers`):
```
PENDIENTE → DESPACHADO → RECIBIDO
                       ↘ CANCELADO  (solo desde DESPACHADO, ForbiddenException si RECIBIDO)
```

**Lotes** (`farmacia/lots`):
```
DISPONIBLE ⇄ CUARENTENA   (quarantine / releaseFromQuarantine)
DISPONIBLE → VENCIDO       (markExpiredLots — tarea programada)
DISPONIBLE → AGOTADO       (automático cuando quantity llega a 0)
```

---

## Frontend — Next.js 14

### Estructura de rutas (App Router)

```
app/
├── (auth)/
│   └── login/           → Página de login
└── (dashboard)/
    ├── layout.tsx        → Shell con sidebar + header
    ├── dashboard/        → KPIs en tiempo real
    ├── reportes/         → Descarga de reportes
    ├── almacen/
    │   ├── activos/      → Inventario + detalle
    │   └── traslados/    → Gestión de traslados
    ├── farmacia/
    │   ├── products/     → Catálogo + detalle por producto
    │   └── stock/
    │       ├── entry/    → Ingreso multi-ítem
    │       └── dispense/ → Dispensación FEFO
    └── sistemas/
        ├── equipos/
        ├── tickets/
        ├── mantenimientos/
        └── licencias/
```

### Autenticación en frontend

El middleware de Next.js (`middleware.ts`) redirige a `/login` si no hay `accessToken` en las cookies. El hook `useAuth` gestiona el ciclo de vida del token y llama a `/api/v1/auth/refresh` antes de que expire.

### PWA

- `manifest.json`: instalable en Android/iOS con shortcuts a Dashboard, Almacén y Farmacia
- `sw.js`: Service Worker con tres estrategias:
  - **Network-first** para `/api/` (siempre datos frescos con fallback a caché)
  - **Cache-first** para imágenes y fuentes (rendimiento)
  - **Stale-while-revalidate** para navegación (carga instantánea + actualización en background)

---

## Base de datos

### Modelos principales

| Modelo | Módulo | Notas |
|--------|--------|-------|
| `User` | Auth | roles M:M via `UserRole` |
| `Sede` | Global | acceso por usuario via `UserSedeAccess` |
| `Asset` | Almacén | `AssetStatus` enum |
| `Movement` | Almacén | `MovementType` enum |
| `Transfer` | Almacén | `TransferStatus` enum |
| `TechAsset` | Sistemas | equipo TIC |
| `Ticket` | Sistemas | `TicketStatus`, `TicketPriority` enums |
| `Maintenance` | Sistemas | status como String (PROGRAMADO/EN_EJECUCION/COMPLETADO/CANCELADO) |
| `License` | Sistemas | vencimiento gestionado manualmente |
| `Product` | Farmacia | stock mínimo, `isControlled` |
| `Lot` | Farmacia | `LotStatus` enum, `expiresAt` para FEFO |
| `ProductStock` | Farmacia | cantidad agregada por producto+sede |
| `StockMovement` | Farmacia | `StockMovementType` enum |
| `AuditLog` | Global | inmutable, nunca se borra |

### Decisiones de diseño

- `Maintenance.status` es `String` (no enum Prisma) porque los valores son controlados por código, no por la BD.
- `ProductStock` es una tabla de agregados actualizada en cada transacción de stock para evitar recalcular sumas constantemente.
- `AuditLog` nunca se modifica ni se elimina. Fallos de auditoría son silenciosos para no bloquear operaciones críticas.
