# Guía de Setup — SIGIA-CEMINSA

Guía para configurar el entorno de desarrollo local desde cero.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20 LTS | `node -v` |
| pnpm | 9.x | `pnpm -v` |
| Docker Desktop | 4.x | `docker -v` |
| Git | 2.x | `git -v` |

Instalar pnpm si no está disponible:
```bash
npm install -g pnpm@9
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Joserafa20/SIGIA-CEMINSA.git
cd SIGIA-CEMINSA
```

---

## 2. Instalar dependencias

```bash
pnpm install
```

Esto instala las dependencias de todos los workspaces (backend, frontend, packages/database) en un solo paso.

---

## 3. Levantar servicios con Docker

```bash
docker compose up -d
```

Levanta:
- **PostgreSQL 16** en `localhost:5432`
- **MinIO** en `localhost:9000` (consola en `localhost:9001`)

Verificar que estén corriendo:
```bash
docker compose ps
```

---

## 4. Variables de entorno

```bash
# Copiar la plantilla al lugar correcto
cp docs/env.example apps/backend/.env
```

Editar `apps/backend/.env` y reemplazar los secretos JWT con valores reales:
```bash
# Generar secretos seguros
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ejecutar ese comando dos veces: uno para `JWT_ACCESS_SECRET` y otro para `JWT_REFRESH_SECRET`.

---

## 5. Generar el cliente Prisma

```bash
cd apps/backend
npx prisma generate --schema=../../packages/database/prisma/schema.prisma
cd ../..
```

> **Nota**: Este paso es obligatorio antes de ejecutar tests o iniciar el backend. El cliente se genera en `packages/database/generated/client/`.

---

## 6. Migrar la base de datos

```bash
cd packages/database
npx prisma migrate deploy
cd ../..
```

Para crear una migración nueva durante desarrollo:
```bash
cd packages/database
npx prisma migrate dev --name describe_your_change
```

---

## 7. Seed inicial (datos de prueba)

```bash
cd apps/backend
npx ts-node src/seed.ts
cd ../..
```

Crea:
- Usuario administrador: `admin@ceminsa.gov.co` / `Admin1234!`
- Sedes de prueba
- Categorías de activos y productos de farmacia base

---

## 8. Iniciar en modo desarrollo

```bash
# Desde la raíz del monorepo — inicia backend y frontend en paralelo
pnpm dev
```

| Servicio | URL |
|---------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001/api/v1 |
| Swagger UI | http://localhost:3001/api/docs |
| MinIO Console | http://localhost:9001 |

---

## 9. Ejecutar los tests

```bash
# Tests unitarios del backend con cobertura
cd apps/backend && pnpm test:cov

# Tests de componentes del frontend
cd apps/frontend && pnpm test

# E2E con Playwright (requiere la app corriendo en puerto 3000)
cd apps/frontend && pnpm test:e2e
```

---

## Solución de problemas comunes

### `@prisma/client` no encuentra los tipos

El cliente está en `packages/database/generated/client`, no en `node_modules/.prisma/client`. Si aparecen errores de importación:

```bash
cd apps/backend
npx prisma generate --schema=../../packages/database/prisma/schema.prisma
```

### Error de conexión a la base de datos

Verificar que Docker esté corriendo y que `DATABASE_URL` en `.env` coincida con las credenciales del `docker-compose.yml`.

```bash
docker compose logs postgres
```

### Puerto 3001 o 3000 ocupado

Cambiar `BACKEND_PORT` en `apps/backend/.env` y `NEXT_PUBLIC_API_URL` en `apps/frontend/.env.local` según corresponda.

---

## Estructura de ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código estable, listo para producción |
| `feature/fase-*` | Desarrollo de cada fase del proyecto |

Los PRs siempre van de `feature/*` → `main`.
