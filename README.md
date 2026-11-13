# SIGIA-CEMINSA

**Sistema Integral de Gestión de Inventarios y Activos Institucionales**  
**ESE Centro Materno Infantil de Sabanalarga — CEMINSA**

---

## Estado del Proyecto

| Fase | Estado | Fecha |
|------|--------|-------|
| Fase 0 — Auditoría y descubrimiento | ✅ Completada | 2026-11-13 |
| Fase 1 — SDD y arquitectura | 🔄 En progreso | 2026-11-13 |
| Fase 2 — Infraestructura y seguridad | ⏳ Pendiente | — |
| Fase 3 — Módulo Almacén | ⏳ Pendiente | — |
| Fase 4 — Módulo Sistemas | ⏳ Pendiente | — |
| Fase 5 — Módulo Farmacia | ⏳ Pendiente | — |
| Fase 6 — Integración y reportes | ⏳ Pendiente | — |
| Fase 7 — QA y auditoría | ⏳ Pendiente | — |
| Fase 8 — Documentación y entrega | ⏳ Pendiente | — |

---

## Descripción

SIGIA-CEMINSA es una aplicación web institucional para la gestión integral de inventarios y activos de la ESE CEMINSA, con tres módulos principales:

- **Almacén**: Gestión de bienes, suministros, muebles, equipos y movimientos institucionales
- **Farmacia**: Medicamentos, dispositivos médicos, control de lotes, vencimientos y método FEFO
- **Sistemas**: Activos tecnológicos, hojas de vida, mantenimientos, mesa de ayuda y tickets

## Tecnología

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript, API REST, Swagger |
| Base de datos | PostgreSQL, Prisma ORM |
| Infraestructura | Docker Compose, MinIO |
| Testing | Jest, Supertest, Playwright |

## Sedes

El sistema gestiona inventarios independientes para 11 sedes:
Administrativa · Paraíso · Campo Bolívar · CDV · Cascajal · Isabel López · Molineros · Aguada de Pablo · La Peña · Colombia · Gallego

## Instalación rápida (desarrollo)

```bash
# Requisitos: Docker, Node.js 20+, pnpm
cp .env.example .env
# Editar .env con valores locales
docker compose up -d
pnpm install
pnpm run dev
```

## Documentación

- [Diagnóstico inicial](docs/diagnostico/)
- [Arquitectura](docs/arquitectura/)
- [SDD](docs/SDD/)
- [Manual de usuario](docs/manual-usuario/)
- [Manual de implementación](docs/manual-implementacion/)

## Repositorio

```
https://github.com/Joserafa20/SIGIA-CEMINSA
```

---

> **IMPORTANTE**: Los archivos de inventario institucional (`insumos/*.xlsx`) NO se publican en este repositorio por contener información sensible. Ver [`.gitignore`](.gitignore).
