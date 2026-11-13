# Modelo de Datos — SIGIA-CEMINSA

## Diagrama de Entidades Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTIDADES BASE                           │
├────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────── │
│   User     │  │  UserRole   │  │     Sede     │  │  AuditLog  │ │
│────────────│  │─────────────│  │──────────────│  │────────────│ │
│ id         │  │ userId      │  │ id           │  │ userId     │ │
│ email      │  │ role        │  │ code         │  │ module     │ │
│ firstName  │  │ module?     │  │ name         │  │ action     │ │
│ lastName   │  └─────────────┘  │ address      │  │ entityType │ │
│ isActive   │                   │ isActive     │  │ oldValues  │ │
└────────────┘                   └──────────────┘  │ newValues  │ │
                                                    └────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MÓDULO ALMACÉN                             │
├──────────────────┐  ┌─────────────────┐  ┌────────────────────  │
│  AssetCategory   │  │     Asset        │  │  AssetMovement     │ │
│──────────────────│  │─────────────────│  │────────────────────│ │
│ id               │  │ id              │  │ assetId            │ │
│ code (CEM-XXX)   │  │ institutionalCode│  │ movementType       │ │
│ name             │  │ plaque          │  │ quantity           │ │
│ assetType        │  │ name            │  │ requestedById      │ │
└──────────────────┘  │ brand/model     │  │ authorizedById     │ │
         ↑            │ serial          │  │ deliveredById      │ │
         │            │ categoryId ─────┘  │ receivedById       │ │
         │            │ sedeId             │ documentRef        │ │
         │            │ status             └────────────────────┘ │
         │            │ initialValue                               │
         └────────────│ currentValue       ┌────────────────────  │
                      │ acquisitionDate    │     Transfer        │ │
                      └─────────────────── │────────────────────│ │
                                ↓          │ originSedeId       │ │
                          TechAsset        │ destinationSedeId  │ │
                         (ver Sistemas)    │ status             │ │
                                           │ DESPACHADO→TRANSITO│ │
                                           │ →RECIBIDO          │ │
                                           └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MÓDULO SISTEMAS                            │
├──────────────────┐  ┌────────────────┐  ┌─────────────────────  │
│    TechAsset     │  │  Maintenance   │  │      Ticket          │ │
│──────────────────│  │────────────────│  │─────────────────────│ │
│ id               │  │ techAssetId    │  │ techAssetId?        │ │
│ assetId (→Asset) │  │ type           │  │ title               │ │
│ processor        │  │ PREVENTIVO     │  │ description         │ │
│ ramGb            │  │ CORRECTIVO     │  │ priority            │ │
│ storageGb        │  │ technicianId   │  │ BAJA/MEDIA/ALTA/    │ │
│ operatingSystem  │  │ scheduledDate  │  │ CRITICA             │ │
│ assignedToId     │  │ executedDate   │  │ status              │ │
│ location         │  │ findings       │  │ ABIERTO→EN_PROGRESO │ │
│ warrantyExpiry   │  │ workDone       │  │ →RESUELTO→CERRADO   │ │
│ qrCode           │  └────────────────┘  └─────────────────────┘ │
└──────────────────┘                                               │
       ↑                                                           │
       │ Asset.techAsset (1:1 cuando viene de Almacén)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MÓDULO FARMACIA                            │
├──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────  │
│   Product    │  │     Lot      │  │ Product  │  │    Stock    │ │
│──────────────│  │──────────────│  │  Stock   │  │ Movement   │ │
│ id           │  │ id           │  │──────────│  │────────────│ │
│ code         │  │ productId    │  │ productId│  │ lotId      │ │
│ activePrinc. │  │ lotNumber    │  │ sedeId   │  │ quantity   │ │
│ category     │  │ expiresAt    │  │ quantity │  │ movType    │ │
│ invima       │  │ status       │  └──────────┘  │ ENTRADA    │ │
│ requiresLot  │  │ DISPONIBLE   │                │ SALIDA     │ │
│ coldChain    │  │ CUARENTENA   │                │ AJUSTE     │ │
│ isControlled │  │ VENCIDO      │                │ TRASLADO   │ │
│ isComodato   │  │ quantity     │                │ VENCIMIENTO│ │
└──────────────┘  └──────────────┘                └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Reglas de Integridad Críticas

| Regla | Implementación |
|-------|---------------|
| No existencias negativas | Constraint en BD + validación en service |
| No dispensar vencido | Validación en Farmacia service (status ≠ VENCIDO) |
| No duplicar activos | UNIQUE en `serial` + `plaque` + `institutionalCode` |
| Movimientos inmutables | Sin delete, solo INSERT de correcciones |
| Trazabilidad completa | requestedBy + authorizedBy + deliveredBy + receivedBy |
| Transferencia por estados | DESPACHADO → EN_TRANSITO → RECIBIDO (no salteable) |
| FEFO farmacia | ORDER BY expiresAt ASC en dispensación |

## Roles y Permisos

| Rol | Almacén | Farmacia | Sistemas | Admin |
|-----|---------|----------|----------|-------|
| SUPER_ADMIN | CRUD+Auth | CRUD+Auth | CRUD+Auth | Sí |
| ADMIN_TIC | Lectura | — | CRUD | Config técnica |
| ALMACENISTA | CRUD+Auth | — | Lectura | No |
| REGENTE_FARMACIA | — | CRUD+Auth | — | No |
| TECNICO_SISTEMAS | — | — | CRUD | No |
| RESPONSABLE_SEDE | Solicitar | Solicitar | Solicitar | No |
| CONTROL_INTERNO | Lectura | Lectura | Lectura | No |
| CONTABILIDAD | Lectura | Lectura | Lectura | No |
| SOLICITANTE | Solicitar | — | Ticket | No |
