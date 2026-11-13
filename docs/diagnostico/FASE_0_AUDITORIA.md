# Fase 0 — Auditoría y Diagnóstico Inicial

**Fecha**: 2026-11-13  
**Ejecutado por**: Sistema autónomo SIGIA-CEMINSA  
**Estado**: ✅ Completado

---

## 1. Estado del Repositorio Local

- **Directorio**: `C:\Users\LENOVO\Desktop\test\SIGIA-CEMINSA`
- **Git previo**: No existía. Inicializado en esta sesión.
- **Remoto configurado**: `https://github.com/Joserafa20/SIGIA-CEMINSA.git`
- **Archivos preexistentes**: Únicamente el directorio `insumos/` con los tres Excel de inventario

---

## 2. Análisis de Archivos de Inventario

### 2.1 inventario_almacen.xlsx

| Hoja | Registros de datos | Descripción |
|------|-------------------|-------------|
| INSTRUCTIVO | 16 | Instrucciones del formato |
| CODIGOS | 72 | Catálogo de tipos y categorías de activos (CEM-001 a CEM-073) |
| FORMATO | 8 | Plantilla vacía |
| ADMINISTRATIVA | ~226 | Inventario sede administrativa |
| PARAISO | ~180 | Inventario sede Paraíso |
| CAMPO BOLIVAR | ~200 | Inventario sede Campo Bolívar |
| CDV | ~210 | Inventario sede CDV |
| CASCAJAL | ~170 | Inventario sede Cascajal |
| ISABEL LOPEZ | ~71 | Inventario sede Isabel López |
| MOLINERO | ~120 | Inventario sede Molineros |
| AGUADA | ~134 | Inventario sede Aguada de Pablo |
| LA PEÑA | ~113 | Inventario sede La Peña |
| COLOMBIA | ~66 | Inventario sede Colombia |
| GALLEGO | ~104 | Inventario sede Gallego |
| EQUIPOS BASICOS | ~450 | Equipos básicos médicos (todas las sedes) |
| VALOR DEL INVENTARIO | 28 | Resumen de valores por sede |
| Hoja1 | 12 | Comparativo Marzo 2024 vs Mayo 2025 |

**Total estimado de registros de activos: ~2.044**

#### Estructura de columnas (hojas de inventario):
```
NOMBRE/DESCRIPCION | CANTIDAD | MARCA | MODELO | SERIE | REGISTRO_INVIMA | 
PLACA | TIPO_ACTIVO | CODIGO_TIPO | CATEGORIA | CODIGO_CATEGORIA | 
UBICACION | VALOR_INICIAL | VALOR_TOTAL | VALOR_ACTUAL | FECHA_ADQUISICION | 
ESTADO_B | ESTADO_R | ESTADO_M | VIDA_UTIL | OBSERVACIONES
```

#### Catálogo de categorías identificado (CODIGOS):
- Terrenos y Lotes (CEM-001)
- Edificaciones e Infraestructura (CEM-002)
- Equipos Médicos (CEM-003 a CEM-017) — 15 categorías
- Mobiliario de Oficina (CEM-018+)
- Y más categorías hasta CEM-073

#### Observaciones de calidad:
- Los encabezados están en filas 8-9, no en fila 1 (formato con membrete institucional)
- El campo SERIE contiene valores "DESCONOCIDA" frecuentemente
- El campo REGISTRO_INVIMA usa "NO APLICA" para equipos no sanitarios
- El estado del activo se registra en tres columnas separadas: B (Bueno), R (Regular), M (Malo)
- Algunas hojas tienen estructuras de columnas ligeramente diferentes
- Periodo del inventario: Mayo 2024 a Mayo 2025
- La hoja "EQUIPOS BASICOS" tiene declarados ~1.046.568 filas (error de formato Excel) pero solo ~450 registros reales

### 2.2 inventario_farmacia.xlsx

| Hoja | Registros de datos | Descripción |
|------|-------------------|-------------|
| Hoja1 | ~223 | Inventario de medicamentos y dispositivos médicos |

**Nota crítica**: 657 columnas declaradas — el inventario se extiende horizontalmente por sedes/meses, no verticalmente. Requiere análisis detallado del modelo de datos real.

#### Estructura de columnas (primeras identificadas):
```
DESCRIPCION/PRINCIPIO_ACTIVO | FORMA_FARMACEUTICA | PRESENTACION_COMERCIAL | 
CONCENTRACION | REGISTRO_SANITARIO | LOTE | FECHA_VENCIMIENTO | 
EXISTENCIA_MES_ANTERIOR | ENTRADAS | SALIDAS | EXISTENCIA_ACTUAL | 
FECHA_ENTRADA | VALOR_UNITARIO | VALOR_TOTAL | OBSERVACIONES | COMODATO
```

#### Observaciones de calidad:
- Incluye campo REGISTRO_SANITARIO (control INVIMA) ✅
- Incluye campo LOTE y FECHA_VENCIMIENTO ✅
- Incluye marcador COMODATO (medicamentos en préstamo)
- Menciona CADENA DE FRIO en observaciones
- Periodo del inventario: Agosto 2025
- El modelo de 657 columnas sugiere que cada periodo/sede agrega columnas — antipatrón a corregir en BD relacional
- Responsable identificado: Wilder García - Regente de Farmacia

### 2.3 inventario_sistemas.xlsx

| Hoja | Registros de datos | Descripción |
|------|-------------------|-------------|
| Hoja1 | ~92 | Inventario de equipos tecnológicos |
| Hoja2 | 7 | Actividades/descripción/cumplimiento (posible plan de trabajo) |

#### Estructura de columnas:
```
No.ARTICULO | NOMBRE | DESCRIPCION | LUGAR(SEDE) | DEPARTAMENTO(AREA) | CONDICION_FISICA
```

#### Observaciones de calidad (críticas):
- Estructura MUY básica — faltan: serial, marca, modelo, procesador, RAM, almacenamiento, SO, licencias, garantía, asignado a
- Sin códigos únicos de activo
- Sin historial de mantenimiento
- Sin asignación formal a funcionarios
- El campo "No. ARTÍCULO" parece ser secuencial por tipo, no ID único
- Registros observados: Computadores de escritorio Lenovo, Acer, HP en múltiples sedes

---

## 3. Sedes Confirmadas

Sedes confirmadas en los archivos de inventario:
1. **Administrativa** (sede central ESE CEMINSA)
2. **Paraíso**
3. **Campo Bolívar**
4. **CDV** (Centro de Desarrollo y Vida, posiblemente)
5. **Cascajal**
6. **Isabel López**
7. **Molineros** (escrito "MOLINERO" en el Excel)
8. **Aguada de Pablo** (escrito "AGUADA" en el Excel)
9. **La Peña**
10. **Colombia**
11. **Gallego**

> ⚠️ **Decisión pendiente de validación institucional**: Confirmar nombres oficiales y códigos de cada sede con la entidad.

---

## 4. Hallazgos y Riesgos

### Riesgos de datos:
| # | Hallazgo | Severidad | Acción requerida |
|---|----------|-----------|-----------------|
| 1 | SERIE = "DESCONOCIDA" en múltiples activos — sin trazabilidad única | Alta | Proceso de levantamiento de seriales al importar |
| 2 | Farmacia: 657 columnas — modelo horizontal no normalizable directamente | Alta | Transformación ETL antes de importar |
| 3 | Sistemas: sin serial, marca, modelo en columnas — datos básicos ausentes | Alta | Enriquecimiento de datos antes de importar |
| 4 | EQUIPOS BASICOS: hoja con ~1M filas declaradas (error Excel) | Media | Limpiar al importar con validación por contenido |
| 5 | Estado del activo en tres columnas B/R/M en lugar de un campo enum | Baja | Transformar a enum {BUENO, REGULAR, MALO} |
| 6 | Fechas en formatos inconsistentes entre hojas | Baja | Normalizar en proceso ETL |
| 7 | Caracteres especiales (tildes, ñ) con encoding incorrecto en headers | Baja | UTF-8 en BD, encoding explícito en importador |

### Decisiones institucionales pendientes:
- [ ] Nombres y códigos oficiales de sedes
- [ ] Responsables de cada módulo y sede
- [ ] Reglas de autorización para compras según montos (Ley 80, Resolución interna)
- [ ] Criterios para baja de bienes (comité, umbrales)
- [ ] Medicamentos que requieren cadena de frío (listado oficial)
- [ ] Medicamentos sin lote por naturaleza (ej. reactivos empacados)
- [ ] Integración contable: ¿el sistema reporta a contabilidad o solo gestiona físicamente?

---

## 5. Estructura de Repositorio Creada

```
SIGIA-CEMINSA/
├── apps/
│   ├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   └── backend/           # NestJS + TypeScript + Swagger
├── packages/
│   └── database/          # Prisma schema + migrations + seeds
├── docs/
│   ├── diagnostico/       # Este archivo y análisis de datos
│   ├── SDD/               # Spec-Driven Development artifacts
│   ├── arquitectura/      # Diagramas y decisiones
│   ├── manual-usuario/    # Guías por módulo y rol
│   ├── manual-implementacion/
│   └── reportes-pruebas/
├── insumos/               # Excel originales (en .gitignore)
├── scripts/               # Importación, seeds, utilidades
├── storage/               # Volumen Docker MinIO (en .gitignore)
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── ROADMAP.md
├── TASKS.md
├── SESSION.md
├── CHANGELOG.md
├── DECISION_LOG.md
└── QUALITY_GATE.md
```

---

## 6. Próxima Fase

**Fase 1 — SDD y Arquitectura**:
- Modelo de datos relacional (Prisma schema)
- Roles y permisos (RBAC)
- Diagramas de entidad-relación
- API contracts por módulo
- Historias de usuario prioritarias
- Decisiones técnicas documentadas
