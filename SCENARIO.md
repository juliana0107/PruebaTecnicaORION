# SCENARIO.md — Documento de Arquitectura

**Proyecto:** ORION Maintenance Lite
**Cliente:** Autopistas Inteligentes S.A.
**Versión:** 1.0

---

## 1. Contexto del negocio

Autopistas Inteligentes S.A. opera una red de infraestructura ITS (Intelligent Transportation Systems) distribuida en varios corredores viales. Dentro de esta infraestructura se encuentran activos críticos para la operación: Paneles de Mensajería Variable (PMV), Cámaras CCTV, Estaciones Meteorológicas, Sensores de Tráfico y Aforadores.

Actualmente el mantenimiento de estos activos se realiza con herramientas dispersas y hojas de cálculo, lo que dificulta el control operativo, la planificación y el seguimiento de las actividades. La organización necesita centralizar la gestión del ciclo de vida del mantenimiento.

---

## 2. Objetivo del sistema

ORION Maintenance Lite centraliza la gestión del mantenimiento de la infraestructura ITS de la concesión, permitiendo:

- Administrar los activos ITS de la concesión.
- Crear y gestionar órdenes de trabajo preventivas y correctivas.
- Administrar cuadrillas y asignarlas a órdenes de trabajo.
- Visualizar indicadores operacionales para supervisores y coordinadores.

---

## 3. Alcance funcional

El sistema cubre cuatro módulos principales:

**Gestión de Activos.** CRUD de activos ITS con código único, tipo, ubicación, criticidad y estado. Ciclo de vida controlado con transiciones válidas. Baja lógica mediante estado RETIRADO. Historial de cambios por activo.

**Gestión de Órdenes de Trabajo.** Creación de OTs preventivas y correctivas asociadas a un activo. Máquina de estados que controla las transiciones entre PENDIENTE, ASIGNADA, EN_EJECUCION, PAUSADA, COMPLETADA y CANCELADA. Sincronización automática con el estado del activo y la cuadrilla.

**Gestión de Cuadrillas.** CRUD de cuadrillas con código único, especialidad, zona y líder. Ciclo de vida con estados DISPONIBLE, ASIGNADA, EN_EJECUCION, NO_DISPONIBLE e INACTIVA. Asignación a órdenes de trabajo con validación de disponibilidad.

**Dashboard Operacional.** Vista consolidada de indicadores operacionales: totales, distribuciones por estado, prioridad y tipo, y carga de trabajo por cuadrilla.

---

## 4. Stack tecnológico

**Backend: Node.js 22 + Express 5 + TypeScript.**
Se eligió TypeScript por el tipado estático, que reduce errores en tiempo de desarrollo y mejora la mantenibilidad. Express es un framework minimalista y maduro, ideal para construir una API REST. Node.js 22 permite usar las últimas características del lenguaje y es compatible con las herramientas modernas de testing.

**Base de datos: PostgreSQL 15.**
Es una base de datos relacional robusta con soporte nativo para UUID, transacciones ACID, restricciones de integridad y consultas agregadas eficientes. Se ajusta al modelo de dominio, que tiene relaciones claras entre activos, órdenes de trabajo, cuadrillas e historiales.

**Driver de base de datos: pg (node-postgres).**
Se optó por usar el driver oficial directamente en lugar de un ORM pesado. Esto da control total sobre las consultas SQL, permite transacciones explícitas y evita la "magia" que a veces esconde ineficiencias.

**Validación: Zod.**
Los esquemas declarativos permiten validar todos los inputs con tipos inferidos automáticamente, evitando duplicar interfaces y garantizando que ninguna entrada llegue al servicio sin validar.

**Autenticación: JWT + bcrypt.**
JWT es el estándar para APIs REST sin estado. Bcrypt se usa para hashear contraseñas con 10 rounds. Las contraseñas nunca se guardan en texto plano.

**Testing: Vitest.**
Rápido, moderno y compatible con TypeScript actual, sin conflictos de dependencias.

**Frontend: React 19 + Vite + TypeScript.**
Vite ofrece un servidor de desarrollo con HMR muy rápido. React 19 es la versión estable actual. TypeScript da tipado en los componentes y en la comunicación con la API.

**Estado remoto: TanStack React Query.**
Gestiona caché, invalidación y manejo de errores de las llamadas HTTP. Evita lógica repetitiva de loading y error en cada página.

**Routing: React Router 7.**
Estándar para SPAs en React.

**Estilos: CSS custom con variables.**
Sin dependencias pesadas. Las variables CSS mantienen una paleta consistente y permiten cambiar temas centralizadamente.

**Infraestructura: Docker + Docker Compose.**
Levanta toda la solución con un solo comando y garantiza un entorno reproducible.

---

## 5. Arquitectura general

La solución se compone de tres servicios ejecutándose como contenedores:

El **frontend** es una SPA construida con React y Vite que se sirve en el puerto 3000. Consume la API REST del backend vía HTTP/JSON.

El **backend** es una API REST construida con Express y TypeScript que se ejecuta en el puerto 4000. Está organizado en capas y ejecuta el script de inicialización de base de datos al arrancar.

La **base de datos** es PostgreSQL 15, corre en el puerto 5432 y persiste su información en un volumen Docker.

El flujo de una petición es: el frontend envía una petición HTTP al backend, el backend la procesa a través de sus capas, consulta o modifica PostgreSQL, y devuelve una respuesta JSON.

---

## 6. Separación por capas en el backend

**Routes.** Definen los endpoints HTTP y aplican los middlewares de autenticación y autorización. No contienen lógica.

**Controller.** Recibe el request, valida los datos de entrada con Zod, delega al servicio y devuelve la respuesta HTTP. Es una capa delgada.

**Service.** Contiene toda la lógica de negocio: validación de reglas, máquinas de estados, transacciones, orquestación entre repositorios. Es la capa más importante y la que se testea unitariamente.

**Repository.** Es la única capa que conoce SQL. Ejecuta las consultas a PostgreSQL y devuelve datos crudos. No aplica reglas de negocio.

**Middleware.** Contiene el manejo centralizado de errores, la autenticación JWT y la autorización por rol.

**Shared.** Contiene utilidades transversales: jerarquía de errores custom, wrapper async para handlers, helper para extraer parámetros tipados de Express.

**Config.** Contiene la configuración del pool de PostgreSQL y las variables de entorno.

---

## 7. Decisiones arquitectónicas

**Sin ORM pesado.** Se usa `pg` con SQL parametrizado en lugar de TypeORM o Prisma. Control total sobre las consultas, transacciones explícitas, menos dependencias. El patrón Repository mantiene el SQL aislado.

**Validación centralizada con Zod.** Todos los inputs se validan con esquemas Zod. Los tipos se infieren con `z.infer`. Nunca se confía solo en el frontend.

**Jerarquía de errores custom.** `AppError` como clase base y subclases: `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `BusinessRuleError` (422). El middleware central mapea cada tipo a su código HTTP.

**Transacciones en operaciones críticas.** Crear un activo registra su historial. Cambiar el estado de una OT actualiza el activo, la cuadrilla y el historial. Todo dentro de transacciones para garantizar consistencia.

**Baja lógica.** Los activos pasan a RETIRADO, las cuadrillas a INACTIVA, las OTs a CANCELADA. Se preserva la integridad referencial y la trazabilidad.

**Máquina de estados explícita.** Cada entidad con ciclo de vida tiene un mapa de transiciones permitidas. Las transiciones inválidas lanzan `BusinessRuleError`.

**Sincronización entre módulos.** Al iniciar una OT, el activo pasa a EN_MANTENIMIENTO y la cuadrilla a EN_EJECUCION. Al completar, el activo vuelve a OPERATIVO y la cuadrilla a DISPONIBLE. Al cancelar, la cuadrilla se libera.

**Seed idempotente al arrancar.** El script de inicialización crea las tablas e inserta catálogos base. Los datos de demostración están en un archivo separado.

**Frontend sin librería de UI.** CSS custom con variables para tener control total del diseño.

---

## 8. Modelo de dominio

**Activos ITS.** Representan la infraestructura física. Código único, nombre, tipo, ubicación, criticidad, estado operativo, coordenadas opcionales y fecha de instalación. Ciclo de vida: OPERATIVO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO, RETIRADO (terminal).

**Órdenes de Trabajo.** Actividades de mantenimiento preventivo o correctivo. Código único, tipo, prioridad, descripción, fechas, resolución y motivo de cancelación. Ciclo de vida: PENDIENTE, ASIGNADA, EN_EJECUCION, PAUSADA, COMPLETADA (terminal), CANCELADA (terminal).

**Cuadrillas.** Equipos de técnicos que ejecutan las OTs. Código único, nombre, especialidad, zona, líder, estado. Ciclo de vida: DISPONIBLE, ASIGNADA, EN_EJECUCION, NO_DISPONIBLE, INACTIVA (terminal).

**Usuarios.** Actores del sistema. Email único, contraseña hasheada, nombre y rol (SUPERVISOR, COORDINATOR, TECHNICIAN).

**Historiales.** Registran cada cambio relevante de activos y órdenes de trabajo con fecha, usuario y valores anterior y nuevo.

---

## 9. API REST

**Autenticación.** `POST /api/auth/login` autentica y devuelve JWT. `GET /api/auth/me` devuelve el usuario autenticado.

**Activos.** `GET /api/assets` lista con filtros. `GET /api/assets/:id` devuelve el detalle. `GET /api/assets/:id/history` devuelve el historial. `POST /api/assets` crea. `PUT /api/assets/:id` actualiza. `PATCH /api/assets/:id/status` cambia el estado. `DELETE /api/assets/:id` hace baja lógica.

**Catálogos.** `GET /api/catalogs/asset-types` y `GET /api/catalogs/locations`.

**Órdenes de trabajo.** `GET /api/work-orders` lista. `GET /api/work-orders/:id` detalle. `GET /api/work-orders/:id/history` historial. `POST /api/work-orders` crea. `PATCH /api/work-orders/:id/assign` asigna cuadrilla. `PATCH /api/work-orders/:id/start` inicia. `PATCH /api/work-orders/:id/pause` pausa. `PATCH /api/work-orders/:id/resume` reanuda. `PATCH /api/work-orders/:id/complete` completa. `PATCH /api/work-orders/:id/cancel` cancela.

**Cuadrillas.** `GET /api/crews` lista. `GET /api/crews/:id` detalle. `POST /api/crews` crea. `PUT /api/crews/:id` actualiza. `PATCH /api/crews/:id/status` cambia el estado.

**Dashboard.** `GET /api/dashboard/summary` devuelve todos los indicadores agregados. Endpoints por dominio disponibles.

**Formato.** Respuesta exitosa: `{ data: ..., total?: number }`. Error: `{ error: "mensaje", code: "ERROR_CODE", details?: ... }`.

**Códigos HTTP.** 200 OK, 201 Created, 400 Validation Error, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Business Rule Violation, 500 Internal Server Error.

---

## 10. Autenticación y autorización

**Modelo de seguridad.** JWT firmado con HS256, expiración 8 horas. Contraseñas con bcrypt y 10 rounds. Los roles se validan tanto en backend como en frontend, siendo el backend la fuente de verdad.

**SUPERVISOR.** Ver todos los módulos. Crear y editar activos. Crear órdenes de trabajo. Iniciar, pausar, reanudar y completar OTs. Cancelar OTs. Ver dashboard.

**COORDINATOR.** Ver todos los módulos. Gestionar cuadrillas (crear, editar, cambiar estado). Asignar cuadrillas a OTs. Cancelar OTs. Ver dashboard.

**TECHNICIAN.** Ver activos, órdenes y cuadrillas. Iniciar, pausar y reanudar OTs asignadas. No accede al dashboard.

**Middlewares.** `requireAuth` valida el Bearer token y adjunta el usuario al request. `requireRole(...)` valida el rol.

**Usuarios demo.** Se incluyen tres usuarios en el seed de demostración: `supervisor@orion.com`, `coordinador@orion.com`, `tecnico@orion.com`, todos con contraseña `orion2026`.

**Fuera del alcance.** No hay refresh tokens, rate limiting en login, revocación de tokens, OAuth/SSO ni recuperación de contraseña.

---

## 11. Testing

Se implementaron 28 pruebas unitarias con Vitest distribuidas por módulo, usando mocks del repositorio para validar la lógica de negocio pura.

Las pruebas de activos cubren creación con código único, rechazo por código duplicado, NotFoundError, transiciones de estado válidas e inválidas, y bloqueo de edición cuando el activo está RETIRADO.

Las pruebas de órdenes de trabajo cubren creación, código duplicado, máquina de estados completa y rechazo de transiciones inválidas.

Las pruebas de cuadrillas cubren código único, transiciones y bloqueo de modificación en EN_EJECUCION.

Las pruebas del dashboard validan la orquestación de agregaciones.

El comando `npm test` en la carpeta backend ejecuta todas las pruebas.

---

## 12. Infraestructura y despliegue

La solución se compone de tres servicios orquestados por Docker Compose.

El servicio **database** usa PostgreSQL 15 Alpine, con healthcheck mediante `pg_isready`, persistencia en volumen y credenciales vía variables de entorno.

El servicio **backend** construye su imagen desde Node 22 Alpine, instala dependencias y ejecuta `tsx watch` con el directorio montado como volumen para hot reload.

El servicio **frontend** sigue el mismo patrón, ejecutando Vite con `--host 0.0.0.0` para ser accesible externamente.

Los servicios están conectados en una red interna. El backend espera a que la base esté healthy gracias a `depends_on` con `condition: service_healthy`.

El comando `docker compose up` levanta toda la solución sin pasos manuales. Las variables sensibles se pasan como variables de entorno, no están hardcodeadas.

---

## 13. Estructura del repositorio

**Raíz.** Contiene `docker-compose.yml`, `README.md`, `BACKLOG_REFINED.md`, `SCENARIO.md` y los archivos de backlog originales.

**backend/src.** Subcarpetas: `config` (pool y env), `db` (scripts SQL), `middleware` (auth y errores), `modules` (assets, auth, catalogs, crews, dashboard, work-orders), `shared` (errores y helpers).

**frontend/src.** Subcarpetas: `api` (axios y endpoints), `auth` (contexto y permisos), `components` (componentes reutilizables), `pages` (vistas), `types` (tipos TypeScript).

**docs/images.** Diagramas de flujo de las historias de usuario.

---

## 14. Estrategia de ramas

El proyecto se desarrolló con ramas por feature. Cada historia de usuario tuvo su propia rama y se mergeó a main mediante Pull Request.

Las ramas principales fueron: `feature/refinement`, `feature/docker-environment`, `feature/hu-001-its-assets`, `feature/hu-002-work-orders`, `feature/hu-003-crews`, `feature/hu-004-dashboard`, `feature/frontend`, `feature/frontend-polish` y `feature/auth`.

Los commits siguieron convenciones: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## 15. Supuestos y límites

**Autenticación simplificada.** Sin refresh tokens, rate limiting ni revocación. Los usuarios demo tienen contraseñas conocidas.

**Una OT por cuadrilla en ejecución.** Simplifica la lógica y evita conflictos, aunque limita la operación real.

**Un activo por OT.** Cada orden se asocia a un único activo.

**Sin carga masiva.** No hay importación de datos.

**Sin notificaciones externas.** Solo toasts de confirmación en la UI.

**Dashboard de consulta.** No permite modificar datos ni navegar a registros individuales.

**Sin snapshots.** Los indicadores se calculan en tiempo real.

**Inventario y averías fuera del MVP.** HU-005 y HU-006 quedan documentadas como funcionalidades opcionales.

---

## 16. Mejoras futuras

**Backend.** Sistema de migraciones dedicado. Rate limiting en login. Refresh tokens. Logging estructurado. Health checks más completos.

**Testing.** Pruebas de integración con Supertest contra base de datos de prueba. Pruebas de frontend con Testing Library. Cobertura al 80%.

**Frontend.** Paginación en listados. Vista Kanban de órdenes. Dashboard configurable. Exportación a Excel y PDF.

**DevOps.** CI/CD con GitHub Actions. Dockerfile de producción multi-stage.

**Negocio.** Inventario de materiales (HU-005) con validación de stock. Generación automática de averías (HU-006) mediante job programado. OTs hijas. Gestión de turnos y jornadas. Georreferenciación de activos y cuadrillas.

---

## 17. Conclusión

ORION Maintenance Lite centraliza la gestión del mantenimiento de la infraestructura ITS de Autopistas Inteligentes S.A. con los siguientes atributos:

Comprensión del dominio reflejada en el modelo de entidades, las reglas de negocio y las máquinas de estados.

Arquitectura por capas con separación clara de responsabilidades, control total de las consultas SQL y transacciones en las operaciones críticas.

Buenas prácticas de código: validación centralizada con Zod, jerarquía de errores custom, tipado fuerte y patrón Repository.

Autenticación y autorización por roles con JWT, bcrypt y middlewares reutilizables.

Ejecución sin fricción mediante `docker compose up`, con health checks, volúmenes persistentes y variables externalizadas.

Trazabilidad completa mediante tablas de historial para activos y órdenes de trabajo.

Testing automatizado con 28 pruebas unitarias cubriendo las reglas de negocio más importantes.

Documentación técnica completa y backlog refinado.