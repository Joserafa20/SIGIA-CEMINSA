# Quality Gate — SIGIA-CEMINSA

## Reglas No Negociables

| # | Regla | Verificación |
|---|-------|-------------|
| QG-01 | No botones sin funcionalidad | Manual en cada PR |
| QG-02 | No persistencia simulada con localStorage | Code review |
| QG-03 | No datos ficticios como sustituto de BD | Test de integración |
| QG-04 | No TODO en funcionalidades principales | grep en CI |
| QG-05 | No errores silenciados | ESLint no-console, error boundaries |
| QG-06 | No pruebas desactivadas para pasar CI | CI policy |
| QG-07 | No funcionalidades declaradas sin verificar | QA sign-off |
| QG-08 | No registros de inventario inventados | Validación ETL |
| QG-09 | No accesos sin autorización | Pruebas de permisos obligatorias |
| QG-10 | No eliminación de trazabilidad | Audit log inmutable |
| QG-11 | No duplicación de activos institucionales | Restricción unique en BD |
| QG-12 | No movimientos sin validaciones | Validaciones en service layer |
| QG-13 | No existencias negativas | Constraint en BD + validación service |
| QG-14 | No dispensación de productos vencidos | Validación en Farmacia service |
| QG-15 | No delete físico de movimientos confirmados | Soft delete + audit only |

## Criterios de Cobertura

- Lógica crítica de negocio: **≥ 80%** de cobertura
- Todas las pruebas críticas: **100% green** antes de merge a main
- Pruebas E2E de flujos principales: **obligatorias**

## Gates por Fase

### Gate Fase 2 (Infraestructura)
- [ ] Docker Compose levanta sin errores
- [ ] Prisma migrations corren sin errores
- [ ] Endpoints de auth retornan 200/401 correctamente
- [ ] RBAC bloquea accesos no autorizados

### Gate Fase 3 (Almacén)
- [ ] No permite existencias negativas
- [ ] Transferencias tienen los tres estados
- [ ] Kardex refleja todos los movimientos
- [ ] Ajustes quedan registrados con usuario y motivo
- [ ] Cobertura ≥ 80% en módulo Almacén

### Gate Fase 4 (Sistemas)
- [ ] Un activo transferido desde Almacén mantiene su identidad única
- [ ] No permite duplicar serial de equipo
- [ ] Historial técnico es inmutable

### Gate Fase 5 (Farmacia)
- [ ] No permite dispensar producto vencido
- [ ] FEFO se aplica correctamente
- [ ] Alertas de vencimiento funcionan

### Gate Final (Producción)
- [ ] Todas las pruebas críticas en verde
- [ ] Sin vulnerabilidades conocidas (OWASP básico)
- [ ] Manual de usuario completo
- [ ] Manual de implementación completo
- [ ] docker-compose de producción documentado
