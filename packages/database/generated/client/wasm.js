
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  lastName: 'lastName',
  documentId: 'documentId',
  phone: 'phone',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  module: 'module'
};

exports.Prisma.SedeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  address: 'address',
  municipality: 'municipality',
  department: 'department',
  phone: 'phone',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserSedeAccessScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sedeId: 'sedeId',
  module: 'module'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  module: 'module',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.AssetCategoryScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  assetType: 'assetType',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.AssetScalarFieldEnum = {
  id: 'id',
  institutionalCode: 'institutionalCode',
  plaque: 'plaque',
  name: 'name',
  description: 'description',
  brand: 'brand',
  model: 'model',
  serial: 'serial',
  invima: 'invima',
  categoryId: 'categoryId',
  sedeId: 'sedeId',
  status: 'status',
  initialValue: 'initialValue',
  currentValue: 'currentValue',
  acquisitionDate: 'acquisitionDate',
  usefulLifeYears: 'usefulLifeYears',
  observations: 'observations',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssetMovementScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  movementType: 'movementType',
  quantity: 'quantity',
  previousValue: 'previousValue',
  newValue: 'newValue',
  requestedById: 'requestedById',
  authorizedById: 'authorizedById',
  deliveredById: 'deliveredById',
  receivedById: 'receivedById',
  transferId: 'transferId',
  documentRef: 'documentRef',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.TransferScalarFieldEnum = {
  id: 'id',
  originSedeId: 'originSedeId',
  destinationSedeId: 'destinationSedeId',
  status: 'status',
  dispatchedAt: 'dispatchedAt',
  receivedAt: 'receivedAt',
  rejectedAt: 'rejectedAt',
  rejectionReason: 'rejectionReason',
  notes: 'notes',
  documentRef: 'documentRef'
};

exports.Prisma.TechAssetScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  sedeId: 'sedeId',
  processor: 'processor',
  ramGb: 'ramGb',
  storageGb: 'storageGb',
  storageType: 'storageType',
  operatingSystem: 'operatingSystem',
  osVersion: 'osVersion',
  macAddress: 'macAddress',
  ipAddress: 'ipAddress',
  warrantyExpiry: 'warrantyExpiry',
  purchaseOrder: 'purchaseOrder',
  assignedToId: 'assignedToId',
  assignedAt: 'assignedAt',
  location: 'location',
  qrCode: 'qrCode',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LicenseScalarFieldEnum = {
  id: 'id',
  techAssetId: 'techAssetId',
  productName: 'productName',
  licenseKey: 'licenseKey',
  vendor: 'vendor',
  expiresAt: 'expiresAt',
  seats: 'seats',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.MaintenanceScalarFieldEnum = {
  id: 'id',
  techAssetId: 'techAssetId',
  type: 'type',
  description: 'description',
  technicianId: 'technicianId',
  scheduledDate: 'scheduledDate',
  executedDate: 'executedDate',
  nextScheduled: 'nextScheduled',
  cost: 'cost',
  findings: 'findings',
  workDone: 'workDone',
  parts: 'parts',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  techAssetId: 'techAssetId',
  createdById: 'createdById',
  assignedToId: 'assignedToId',
  title: 'title',
  description: 'description',
  priority: 'priority',
  status: 'status',
  resolution: 'resolution',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  closedAt: 'closedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  code: 'code',
  activePrinciple: 'activePrinciple',
  commercialName: 'commercialName',
  pharmaceuticalForm: 'pharmaceuticalForm',
  presentation: 'presentation',
  concentration: 'concentration',
  category: 'category',
  invima: 'invima',
  requiresLot: 'requiresLot',
  requiresColdChain: 'requiresColdChain',
  isControlled: 'isControlled',
  isComodato: 'isComodato',
  minimumStock: 'minimumStock',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LotScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  lotNumber: 'lotNumber',
  expiresAt: 'expiresAt',
  status: 'status',
  quantity: 'quantity',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductStockScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  sedeId: 'sedeId',
  quantity: 'quantity',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockEntryScalarFieldEnum = {
  id: 'id',
  sedeId: 'sedeId',
  documentRef: 'documentRef',
  supplier: 'supplier',
  entryDate: 'entryDate',
  totalValue: 'totalValue',
  notes: 'notes',
  createdById: 'createdById',
  authorizedById: 'authorizedById',
  createdAt: 'createdAt'
};

exports.Prisma.StockMovementScalarFieldEnum = {
  id: 'id',
  lotId: 'lotId',
  stockEntryId: 'stockEntryId',
  movementType: 'movementType',
  quantity: 'quantity',
  unitValue: 'unitValue',
  totalValue: 'totalValue',
  sedeId: 'sedeId',
  destinationSedeId: 'destinationSedeId',
  requestedById: 'requestedById',
  authorizedById: 'authorizedById',
  documentRef: 'documentRef',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  module: 'module',
  entityType: 'entityType',
  entityId: 'entityId',
  fileName: 'fileName',
  fileKey: 'fileKey',
  mimeType: 'mimeType',
  sizeBytes: 'sizeBytes',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_TIC: 'ADMIN_TIC',
  ALMACENISTA: 'ALMACENISTA',
  REGENTE_FARMACIA: 'REGENTE_FARMACIA',
  TECNICO_SISTEMAS: 'TECNICO_SISTEMAS',
  RESPONSABLE_SEDE: 'RESPONSABLE_SEDE',
  CONTROL_INTERNO: 'CONTROL_INTERNO',
  CONTABILIDAD: 'CONTABILIDAD',
  SOLICITANTE: 'SOLICITANTE'
};

exports.Module = exports.$Enums.Module = {
  ALMACEN: 'ALMACEN',
  FARMACIA: 'FARMACIA',
  SISTEMAS: 'SISTEMAS'
};

exports.AssetType = exports.$Enums.AssetType = {
  TANGIBLE: 'TANGIBLE',
  INTANGIBLE: 'INTANGIBLE',
  BIENES_CONSUMO: 'BIENES_CONSUMO'
};

exports.AssetStatus = exports.$Enums.AssetStatus = {
  EXCELENTE: 'EXCELENTE',
  BUENO: 'BUENO',
  REGULAR: 'REGULAR',
  MALO: 'MALO',
  BAJA: 'BAJA',
  EN_TRANSITO: 'EN_TRANSITO'
};

exports.MovementType = exports.$Enums.MovementType = {
  ENTRADA_COMPRA: 'ENTRADA_COMPRA',
  ENTRADA_DONACION: 'ENTRADA_DONACION',
  ENTRADA_TRASLADO: 'ENTRADA_TRASLADO',
  SALIDA_AUTORIZADA: 'SALIDA_AUTORIZADA',
  SALIDA_BAJA: 'SALIDA_BAJA',
  SALIDA_TRASLADO: 'SALIDA_TRASLADO',
  AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
  TRANSFERENCIA_DESPACHO: 'TRANSFERENCIA_DESPACHO',
  TRANSFERENCIA_RECEPCION: 'TRANSFERENCIA_RECEPCION'
};

exports.TransferStatus = exports.$Enums.TransferStatus = {
  DESPACHADO: 'DESPACHADO',
  EN_TRANSITO: 'EN_TRANSITO',
  RECIBIDO: 'RECIBIDO',
  RECHAZADO: 'RECHAZADO'
};

exports.MaintenanceType = exports.$Enums.MaintenanceType = {
  PREVENTIVO: 'PREVENTIVO',
  CORRECTIVO: 'CORRECTIVO'
};

exports.TicketPriority = exports.$Enums.TicketPriority = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  ABIERTO: 'ABIERTO',
  EN_PROGRESO: 'EN_PROGRESO',
  RESUELTO: 'RESUELTO',
  CERRADO: 'CERRADO',
  CANCELADO: 'CANCELADO'
};

exports.ProductCategory = exports.$Enums.ProductCategory = {
  MEDICAMENTO: 'MEDICAMENTO',
  DISPOSITIVO_MEDICO: 'DISPOSITIVO_MEDICO',
  REACTIVO: 'REACTIVO',
  INSUMO_ODONTOLOGICO: 'INSUMO_ODONTOLOGICO',
  INSUMO_ASISTENCIAL: 'INSUMO_ASISTENCIAL'
};

exports.LotStatus = exports.$Enums.LotStatus = {
  DISPONIBLE: 'DISPONIBLE',
  CUARENTENA: 'CUARENTENA',
  VENCIDO: 'VENCIDO',
  AGOTADO: 'AGOTADO'
};

exports.StockMovementType = exports.$Enums.StockMovementType = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
  TRASLADO_ENTRADA: 'TRASLADO_ENTRADA',
  TRASLADO_SALIDA: 'TRASLADO_SALIDA',
  VENCIMIENTO: 'VENCIMIENTO',
  CUARENTENA: 'CUARENTENA'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserRole: 'UserRole',
  Sede: 'Sede',
  UserSedeAccess: 'UserSedeAccess',
  AuditLog: 'AuditLog',
  AssetCategory: 'AssetCategory',
  Asset: 'Asset',
  AssetMovement: 'AssetMovement',
  Transfer: 'Transfer',
  TechAsset: 'TechAsset',
  License: 'License',
  Maintenance: 'Maintenance',
  Ticket: 'Ticket',
  Product: 'Product',
  Lot: 'Lot',
  ProductStock: 'ProductStock',
  StockEntry: 'StockEntry',
  StockMovement: 'StockMovement',
  Document: 'Document'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
