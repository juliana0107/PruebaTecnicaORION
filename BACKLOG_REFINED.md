# Refinamiento del Backlog

## 1. Supuestos Globales del Dominio y Reglas Generales
* Los activos ITS corresponden a infraestructura crítica vial: Paneles de Mensajería Variable (PMV), CCTV, Estaciones Meteorológicas, Sensores de Tráfico y Aforadores.

* No se permite la eliminación física (hard delete) de activos ni cuadrillas si tienen órdenes de trabajo asociadas (integridad y trazabilidad).

* Ciclo de vida estricto de una Orden de Trabajo (OT): `PENDIENTE` -> `ASIGNADA` -> `PAUSADA` -> `EN_EJECUCION` -> `COMPLETADA` (o `CANCELADA` desde estados no terminales).


## 2. Refinamiento por Historia de Usuario

### HU-001: Gestión de Activos ITS
* **1. Análisis:**

  * *Ambigüedades:*

  - No se especifican todos los datos que debe contener cada activo.
  - No se define el identificador único de los activos.
  - No se establece cómo se registrará la ubicación de los activos.
  - No se encuentran definidos los estados posibles de un activo ni sus transiciones.
  - No se especifica el manejo de activos retirados o eliminados.
  - No se encuentran definidos los permisos específicos del supervisor de mantenimiento.
  - No se establece si cada tipo de activo tendrá información técnica particular.
  
  * *Dependencias:* 

  - Base de datos para almacenar la información de los activos.
  - Catálogo de tipos de activos ITS.
  - Catálogo de estados de los activos.
  - Sistema de autenticación y autorización de usuarios.
  - Información de ubicación de la infraestructura.
  - Inventario actual de activos para una posible migración.
  - Servicios backend/API para la gestión de activos.

  * *Riesgos:* 
  
  - Datos incompletos del inventario actual
  - Duplicidad de activos
  - Usuarios sin permisos adecuados
  - Información incorrecta sobre la ubicación de los activos.
  - Eliminación accidental de información histórica.
  - Tipos de activos insuficientemente definidos
  - Inconsistencia entre inventario y actividades de mantenimiento
  - Migración incorrecta 
  - Falta de trazabilidad sobre modificaciones.
  - Cambios frecuentes en los requisitos


  * *Supuestos:* 

  - El supervisor de mantenimiento es un usuario autenticado dentro del sistema.
  - El supervisor tiene permisos para consultar y modificar los activos ITS.
  - Cada activo posee un identificador único dentro del inventario.
  - Los tipos iniciales de activos son PMV, CCTV, estaciones meteorológicas, sensores de tráfico y aforadores.
  - Un activo puede cambiar de estado durante su ciclo de vida.
  - El inventario debe permitir consultar los activos registrados.
  - Los activos registrados pueden asociarse a actividades de mantenimiento
  - El sistema debe conservar la integridad de la información y evitar registros duplicados
  - La aplicación contará con mecanismos de autenticación y autorización
  - Los activos que ya no estén operativos no necesariamente deben eliminarse del inventario; pueden requerir un estado de baja o inactividad

* **2. Refinamiento:**

  * *Entidades involucradas:* 
  - ActivoITS
  - TipoActivo
  - Ubicacion
  - HistorialActivo
  - Usuario

    *Entidades relacionadas:*
    - OrdenTrabajo
    - Averia
  * *Reglas de negocio:* 
  
   - RN-01. Cada activo debe tener un código único dentro del inventario de la concesión.
   - RN-02. Cuando un tipo de activo requiera número de serie, este deberá ser único para ese tipo de activo.
   - RN-03. Para registrar un activo deben diligenciarse los campos obligatorios definidos por el negocio.
   - RN-04. El tipo de activo debe pertenecer al catálogo autorizado.
   - RN-05. El activo debe contar con una ubicación válida.
   - RN-06. Al crear un activo, este deberá recibir un estado el cual sera OPERATIVO, salvo que el negocio defina explícitamente otro estado inicial.
   - RN-07. El supervisor podrá modificar la información permitida del activo.
   - RN-08. El sistema debe evitar modificaciones que generen duplicidad de identificadores.
   - RN-09. Toda modificación relevante de un activo debe registrarse en el historial, incluyendo como mínimo la fecha, el usuario responsable y el tipo de cambio.
   - RN-10. Los activos retirados no se eliminan físicamente y permanecen en el inventario con estado RETIRADO.
   - RN-11. Un activo retirado debe conservarse en el inventario con un estado que indique su condición.
   - RN-12. Un activo debe poder identificarse de manera inequívoca para permitir su futura asociación con órdenes de trabajo y averías.
   

  * *Estados:*
  - Operativo(Por defecto) - Puede pasar a (En Mantenimiento, Fuera de Servicio, Retirado)
  - En Mantenimiento - Puede pasar a ( Operativo, Fuera de Servicio, Retirado)
  - Fuera de Servicio - Puede pasar a (Operativo, Retirado)
  - Retirado - (Este estado no puede cambiar de estado)

  * *Relaciones:*
  - Un tipo de activo puede tener muchos activos.
  - Una ubicación puede tener uno o varios activos.
  - Un activo puede tener múltiples registros históricos.
  - Un activo puede tener múltiples órdenes de trabajo durante su vida útil.
  - Un activo puede presentar múltiples averías durante su ciclo de vida.

  * *Flujo funcional:*
![alt text](HU1.png)

* **Criterios de aceptación:**

  * *CA-01 — Crear activo*
  - Dado un supervisor autenticado con permiso,
  - Cuando registra un activo con código único, tipo, ubicación y criticidad,
  - Entonces el activo se guarda en estado OPERATIVO y se registra en el historial.

  * *CA-02 — Código único*
  - Dado que existe un activo con código `PMV-COR1-001`,
  - Cuando se intenta crear otro activo con el mismo código,
  - Entonces el sistema rechaza la operación con error de unicidad.

  * *CA-03 — Campos obligatorios*
  - Dado un formulario de activo,
  - Cuando se intenta guardar sin código, tipo o ubicación,
  - Entonces el sistema muestra errores de validación y no persiste.

  * *CA-04 — Editar activo*
  - Dado un activo existente,
  - Cuando el supervisor modifica campos permitidos,
  - Entonces el sistema actualiza el activo y registra el cambio en el historial.

  * *CA-05 — Baja lógica*
  - Dado un activo operativo,
  - Cuando el supervisor lo da de baja,
  - Entonces el activo pasa a RETIRADO y no se elimina físicamente.

  * *CA-06 — Historial*
  - Dado cualquier cambio relevante de un activo,
  - Cuando se consulta el detalle,
  - Entonces el historial muestra usuario, fecha y tipo de cambio.

  * *CA-07 — Activo retirado*
  - Dado un activo en estado RETIRADO,
  - Cuando se intenta asociarlo a una nueva OT,
  - Entonces el sistema rechaza la operación.

* **3. Descomposición Técnica:**

  * *Backend:* 
  - Crear modelo `Asset`.
  - Implementar servicio de gestión de activos.
  - Implementar controladores.
  - Crear endpoints CRUD.
  - Implementar validaciones de negocio.
  - Implementar gestión de cambios de estado.
  - Implementar registro de historial.
  - Definir los tipos iniciales.
  - Definir los atributos principales del activo.
  - Validaciónes de datos obligatorios y validos.
 (M)

  * *Frontend:* 
Vista de activos, formulario modal con validaciones, barra de búsqueda y filtros rápidos.
  Creación de :
  - Formulario de registro.
  - Listado de activos.
  - Edición de activos.
  - Detalle de activo (Historial de activo).
  - Gestión de estado.
   (M)

  * *Persistencia:*
  - Crear tabla `assets`.
  - Crear tabla `asset_types`.
  - Crear tabla `locations`.
  - Crear tabla `asset_history`.
  - Definir claves primarias y foráneas.
  - Crear índice único para `assets.code`.
  - Crear índices para `status`, `asset_type_id` y `location_id`.
  - Configurar migraciones.
  - Definir restricciones de integridad referencial.

  * *Seguridad:*
  - Proteger endpoints de gestión de activos.
  - Validar autenticación del usuario.
  - Validar autorización según rol.
  - Permitir modificación únicamente a usuarios autorizados.
  - Validar todos los datos recibidos en backend.
  - No confiar exclusivamente en las validaciones del frontend.
  (M)
  * *Testing:*
  Unit tests backend:
    - Validación de campos obligatorios.
    - Unicidad de código (RN-01, RN-02).
    - Transiciones de estado permitidas y restricciones de modificación de estados.
    - Baja lógica sin eliminación física (RN-11).
  Unit tests frontend:
    - Renderizado del listado con filtros.
    - Mensajes de error en formulario.
    - Validaciones de campos obligatorios.
  Tests de integración:
    - Crear activo mediante API.
    - Consultar activo mediante API.
    - Editar activo.
    - Cambiar estado.
    - Verificar persistencia en PostgreSQL.
    - Verificar contrato de endpoints mediante Supertest.
  (M)

  * *Docker:*
    - Crear Dockerfile del backend.
    - Crear Dockerfile del frontend.
    - Configurar PostgreSQL en docker-compose.
    - Configurar variables de entorno.
    - Configurar healthcheck de servicios.
    - Configurar persistencia de PostgreSQL mediante volumen.
    - Verificar ejecución completa mediante: docker compose up
    (S)

* **4. Estimación:**   
  - Modelo ActivoITS	S
  - Catálogo de tipos de activo	S
  - API de activos	M
  - Validaciones de negocio	M
  - Persistencia y relaciones	M
  - Historial de cambios	M
  - Listado de activos	M
  - Formulario de registro	M
  - Edición de activos	S
  - Gestión de estado / baja lógica	S
  - Detalle del activo	S
  - Búsqueda y filtros  S
  - Autenticación	S
  - Autorización por rol	M
  - Pruebas backend	M
  - Pruebas frontend	M
  - Pruebas de integración	M
  - Configuración Docker	S


* **5. Prioridad:** 

  * **MVP:**
  - Crear activos ITS.
  - Consultar el inventario.
  - Consultar el detalle de un activo.
  - Editar información del activo.
  - Validar código único.
  - Validar campos obligatorios.
  - Asignar y consultar el tipo de activo.
  - Registrar ubicación.
  - Gestionar el estado del activo.
  - Realizar baja lógica mediante estado RETIRADO.
  - Persistir la información en base de datos.
  - Aplicar autenticación y autorización.
  - Registrar historial básico de cambios.
  - Realizar pruebas principales.

 * **Funcionalidades opcionales:**
  - Búsqueda avanzada.
  - Filtros avanzados.
  - Carga masiva.
  - Importación del inventario existente.
  - Exportación del inventario.
  - Campos técnicos específicos según el tipo de activo.

 * **Mejoras futuras:**
  - Georreferenciación mediante mapas.
  - Integración con sistemas de monitoreo ITS.
  - Actualización automática del estado mediante sensores.
  - Integración con plataformas externas.
  - Notificaciones automáticas relacionadas con cambios de estado.

  
* **6. Justificación:**

Se agregó AssetHistory porque los activos forman parte de infraestructura
ITS y sus cambios deben conservar trazabilidad.

Se agregó AssetType como entidad independiente para evitar almacenar
tipos de activos como texto libre y permitir su administración mediante
catálogo.

Se agregó Location como entidad independiente para mantener una
estructura consistente de ubicación y permitir futuras ampliaciones,
como georreferenciación.

Se decidió utilizar baja lógica mediante el estado RETIRADO en lugar
de eliminación física para conservar la relación histórica entre activos
y órdenes de trabajo.

La validación de unicidad del código se implementará tanto en la capa
de negocio como mediante una restricción UNIQUE en base de datos.

La carga masiva se considera opcional y no forma parte del núcleo del
MVP.

---

### HU-002: Gestión de Órdenes de Trabajo (OT)
* **1. Análisis:**

  * *Ambigüedades:*

  - No se define qué diferencia una OT preventiva de una correctiva.
  - No se especifica qué campos son obligatorios al crear una OT.
  - No se define el ciclo de vida completo ni las transiciones permitidas entre estados.
  - No se establece si una OT puede reabrirse después de completada o cancelada.
  - No se aclara si una OT puede estar asociada a más de un activo o solo a uno.
  - No se indica si se requiere registrar el diagnóstico, la causa raíz o la solución aplicada.
  - No se define si la asignación de cuadrilla es obligatoria para pasar a "En ejecución".
  - No se especifica si la OT puede pausarse.
  - No se aclara si el consumo de materiales debe registrarse obligatoriamente al cerrar la OT.
  - No se define quién puede cancelar una OT ni bajo qué condiciones.
  - No se especifican las condiciones necesarias para completar una OT.
  - No se especifica si existe prioridad (baja, media, alta, crítica) o solo orden de creación.
  - No se indica si la OT tiene fecha límite (SLA) y qué pasa si se vence.
  - No se define si una OT puede generar una OT hija (por ejemplo, si al inspeccionar se detecta una avería adicional o un cambio de Equipo).
  - No se aclara si una OT preventiva se genera a partir de un plan de mantenimiento periódico.
  - No se define si una OT puede crearse sin una cuadrilla asignada previamente.
  - No se especifica qué información técnica de cierre (evidencias, causas, observaciones) es obligatoria para dar por finalizada la orden.
  - 

  * *Dependencias:*

  - HU-001 (Activos): la OT debe asociarse a un activo existente.
  - Catálogo de tipos de mantenimiento (preventiva, correctiva).
  - HU-003 (Cuadrillas): la OT se asigna a una cuadrilla.
  - HU-005 (Inventario, opcional): consumo de materiales al ejecutar la OT.
  - HU-006 (Averías, opcional): una avería puede generar una OT correctiva.
  - Catálogo de estados de OT.
  - Catálogo de prioridades.
  - Sistema de autenticación y autorización.
  - Persistencia de transiciones e historial de cambios de estado.

  * *Riesgos:*

  - Creación de órdenes sobre activos en estado RETIRADO o inexistentes.
  - Transiciones de estado mal definidas que permitan dejar la OT en estados inconsistentes.
  - Que una OT quede asignada a una cuadrilla inexistente o inactiva.
  - Que se completen OT sin registrar evidencias ni materiales consumidos.
  - Que una OT preventiva se cree sin periodicidad ni plan asociado.
  - Que se genere duplicidad de OT sobre el mismo activo y misma falla.
  - Que se pierda trazabilidad de quién cambió el estado y cuándo.
  - Transiciones de estado inválidas (ej. marcar como COMPLETADA una orden sin pasar por EN_EJECUCION o sin notas de resolución).
  - Que se cancelen OT sin motivo ni responsable registrado.
  - Que una OT quede sin cuadrilla por tiempo indefinido.
  - Cambios concurrentes sobre una misma orden de trabajo.
  - Que el dashboard muestre indicadores inconsistentes por estados mal modelados.
  - Que una OT correctiva no actualice el estado del activo (fuera de servicio / en mantenimiento).

  * *Supuestos:*

  - Cada OT se asocia a un único activo (relación 1:N desde activo).
  - Una OT puede ser de tipo PREVENTIVA o CORRECTIVA.
  - Los estados del ciclo de vida del MVP son: PENDIENTE, ASIGNADA, EN_EJECUCION, PAUSADA, COMPLETADA, CANCELADA.
  - Una OT en estado COMPLETADA o CANCELADA es terminal y no puede reabrirse (se crea una nueva si aplica).
  - La prioridad puede ser BAJA, MEDIA, ALTA o CRITICA.
  - Una OT correctiva puede originarse desde una avería (HU-006).
  - Se registra el usuario y la fecha en cada cambio de estado (auditoría).
  - El supervisor puede Validar la información de cierre y Realizar cierre formal.
  - El coordinador puede asignar cuadrillas (HU-003).
  - El técnico puede inicia/ejecuta, reporta avance, pausar y registra información técnica de ejecución.
  - Toda nueva OT se crea en estado PENDIENTE. La asignación de una cuadrilla genera posteriormente el cambio a ASIGNADA.
  - La fecha programada es obligatoria para OT preventivas; opcional para correctivas.
  - Al crearse una OT de tipo CORRECTIVO con prioridad alta/crítica, el activo vinculado va a cambiar automáticamente su estado a EN_MANTENIMIENTO o FUERA_DE_SERVICIO.
  - Un cambio a estado EN_EJECUCION requiere cuadrilla asignada.
  - Un cambio a estado COMPLETADA requiere registro de cierre (comentario, materiales si aplica).
  - El sistema debe conservar un historial de los cambios relevantes realizados sobre la OT.
  - El sistema debe mantener la integridad entre la OT, el activo y la cuadrilla asociada.
  - El consumo de materiales es opcional para el MVP y se marca como funcionalidad de HU-005.
  - Solo usuarios con rol autorizado (Supervisor/Coordinador) pueden crear, cancelar o aprobar el cierre formal de una OT.

* **2. Refinamiento:**

  * * Entidades involucradas.:*
  
  - OrdenTrabajo
  - ActivoITS
  - Usuario
  - HistorialOrdenTrabajo
  
    * *Entidades relacionadas*:
    - Cuadrilla
    - TipoMantenimiento
    - Averia
    - Material
    - ConsumoMaterial

  * *Reglas de Negocio:* 
  
  - RN-01. Cada orden de trabajo debe tener un código único dentro del sistema y no se permitirá registrar códigos duplicados.
  - RN-02. Toda OT debe estar asociada a un activo ITS existente y válido.
  - RN-03. El tipo de mantenimiento debe pertenecer al catálogo autorizado.
  - RN-04. El tipo de mantenimiento de una OT debe ser PREVENTIVO o CORRECTIVO.
  - RN-05. Toda OT debe tener una prioridad definida: BAJA, MEDIA, ALTA o CRITICA.
  - RN-06. La fecha programada es obligatoria para las OT preventivas y opcional para las OT correctivas.
  - RN-07. Una OT solo puede pasar a ASIGNADA cuando tenga una cuadrilla válida asociada.
  - RN-08. Una OT solo puede pasar de ASIGNADA a EN_EJECUCION cuando se inicie formalmente la actividad de mantenimiento.
  - RN-09. Una OT solo puede pasar de EN_EJECUCION a COMPLETADA cuando se registre la información de resolución correspondiente.
  - RN-10. Una OT puede pasar a CANCELADA desde estados no terminales, conservando el motivo de cancelación.
  - RN-11. No se permiten transiciones de estado diferentes a las definidas para el ciclo de vida de la OT.
  - RN-12. Una OT en estado COMPLETADA o CANCELADA se considera cerrada y no puede regresar a un estado anterior.
  - RN-13. Al completar una OT se debe registrar la fecha de cierre y la información de resolución.
  - RN-14. Los cambios relevantes de una OT deben registrar fecha, usuario responsable y estado resultante.
  - RN-15. Una OT no debe poder asociarse a un activo retirado para nuevas actividades de mantenimiento.
  - RN-16. Las OTs completadas o canceladas no deben eliminarse físicamente cuando tengan información histórica asociada.
  - RN-17. Una OT correctiva puede estar asociada a una avería o falla identificada en el activo.
  - RN-18. El sistema debe impedir inconsistencias entre el estado de una OT y las condiciones necesarias para avanzar en su ciclo de vida.
  - RN-19. Una OT en estado EN_EJECUCION puede pasar a PAUSADA cuando el técnico registre el motivo de la pausa.
  - RN-20. Al iniciar una OT de mantenimiento, el activo asociado podrá pasar a EN_MANTENIMIENTO, de acuerdo con las reglas operativas definidas para el mantenimiento.
  - RN-21. Una OT en estado PAUSADA solo puede regresar a EN_EJECUCION o pasar a CANCELADA.
 
  * *Estados:*

  - Pendiente (por defecto) Puede pasar a (Asignada, Cancelada)
  - Asignada Puede pasar a (En Ejecución, Cancelada)
  - En Ejecución Puede pasar a (Pausada, Completada, Cancelada)
  - Pausada Puede pasar a (En Ejecución, Cancelada)
  - Completada (Terminal) (No puede cambiar de estado)
  - Cancelada (Terminal) (No puede cambiar de estado)

  * *Relaciones:*

  - Un activo ITS puede tener asociadas múltiples órdenes de trabajo a lo largo de su vida útil.
  - Una orden de trabajo pertenece a un único activo ITS.
  - Una cuadrilla puede atender múltiples órdenes de trabajo en el tiempo, pero solo se le recomienda una orden en estado EN_EJECUCION en un instante dado.
  - Una orden de trabajo puede tener una cuadrilla asignada para su ejecución.
  - Un usuario puede crear múltiples órdenes de trabajo.
  - Una orden de trabajo puede tener múltiples registros históricos.

  * *Flujo funcional:* 
  ![alt text](HU2.png)

* **Criterios de aceptación:**
  * *CA-01 — Crear OT*
    - Dado un supervisor autenticado con permiso,
    - Cuando crea una OT con activo válido, tipo, prioridad, descripción y fecha programada,
    - Entonces la OT se guarda en estado PENDIENTE y se registra en el historial.

    * *CA-02 — Código único*
    - Dado que existe una OT con código `OT-PREV-2026-0001`,
    - Cuando se intenta crear otra OT con el mismo código,
    - Entonces el sistema rechaza la operación con un error de unicidad.

    * *CA-03 — Asignar cuadrilla*
    - Dado una OT en estado PENDIENTE,
    - Cuando el coordinador asigna una cuadrilla válida,
    - Entonces la OT pasa a ASIGNADA y se registra el cambio en el historial.

    * *CA-04 — Iniciar ejecución*
    - Dado una OT en estado ASIGNADA con una cuadrilla válida, 
    - Cuando el técnico inicia la actividad, 
    - Entonces la OT pasa a EN_EJECUCION.

    * *CA-05 — Completar OT*
    - Dado una OT en estado EN_EJECUCION con información de resolución registrada,
    - Cuando el supervisor valida el cierre,
    - Entonces la OT pasa a COMPLETADA y el activo pasa a OPERATIVO si la condición que originó el mantenimiento fue resuelta.

    * *CA-06 — Cancelar OT*
    - Dado una OT en cualquier estado no terminal,
    - Cuando el supervisor cancela la OT indicando un motivo,
    - Entonces la OT pasa a CANCELADA conservando motivo, usuario y fecha.

    * *CA-07 — Transición inválida*
    - Dado una OT en estado PENDIENTE,
    - Cuando se intenta completarla directamente,
    - Entonces el sistema rechaza la transición con un mensaje de error.

    * *CA-08 — Estado terminal*
    - Dado una OT en estado COMPLETADA o CANCELADA,
    - Cuando se intenta cambiar su estado,
    - Entonces el sistema rechaza la operación porque el estado es terminal.

    * *CA-09 — Activo retirado*
    - Dado un activo en estado RETIRADO,
    - Cuando se intenta crear una OT asociada,
    - Entonces el sistema rechaza la operación.

    * *CA-10 — Historial*
    - Dado cualquier cambio de estado de una OT,
    - Cuando se consulta el detalle,
    - Entonces el historial muestra estado origen, estado destino, usuario, fecha y comentario.

    * *CA-11 — Pausar OT*
    - Dado una OT en estado EN_EJECUCION,
    - Cuando el técnico registra un motivo de pausa,
    - Entonces la OT pasa a PAUSADA y el cambio queda registrado en el historial.

    * *CA-12 — Reanudar OT*
    - Dado una OT en estado PAUSADA,
    - Cuando el técnico reanuda la actividad,
    - Entonces la OT pasa a EN_EJECUCION y se registra el cambio en el historial.

* **3. Descomposición Técnica:**

  * *Backend:* 
  
  - Crear modelo WorkOrder y WorkOrderHistory.
  - Implementar servicio de gestión de órdenes de trabajo.
  - Implementar controladores.
  - Crear endpoints para crear, consultar, actualizar y gestionar el estado de las OTs.
  - Implementar validaciones de negocio.
  - Implementar validación de existencia del activo asociado.
  - Implementar validación del tipo de mantenimiento.
  - Implementar validación de prioridad.
  - Implementar máquina de estados para controlar las transiciones de la OT.
  - Validar que una OT no pueda avanzar de estado sin cumplir las condiciones requeridas.
  - Implementar registro de resolución al completar una OT.
  - Implementar registro de historial de cambios.
  - Implementar control para evitar duplicidad del código de OT.
  - Implementar operaciones transaccionales para cambios críticos de estado.
  - Implementar consulta de OTs por activo, estado, prioridad y tipo.

(L)
  
  * *Frontend:* 
  
  - Crear vista de órdenes de trabajo.
  - Crear listado de OTs.
  - Crear formulario de creación.
  - Crear formulario de edición de información permitida.
  - Crear filtros por estado, prioridad, tipo y activo.
  - Mostrar badges visuales para estados y prioridades.
  - Crear detalle de la OT.
  - Mostrar activo asociado.
  - Mostrar cuadrilla asignada.
  - Crear control visual para las transiciones de estado permitidas.
  - Crear formulario para registrar la resolución al finalizar una OT.
  - Mostrar historial de cambios.
  - Mostrar mensajes de validación y errores provenientes del backend.

(L)

  * *Persistencia:*
  - Crear tabla work_orders.
  - Crear tabla work_order_history.
  - Definir relación entre work_orders y assets.
  - Definir relación entre work_orders y crews.
  - Definir relación entre work_orders y users.
  - Definir claves primarias y foráneas.
  - Almacenar la información de resolución y cierre dentro de work_orders.
  - Crear índice único para work_orders.code.
  - Crear índices para status, priority, type, asset_id y crew_id.
  - Configurar restricciones de integridad referencial.
  - Configurar migraciones.
  - Garantizar la persistencia del historial de las OTs.
  - Evitar eliminación física de OTs con información histórica relacionada.

(M)

  * *Seguridad:*

  - Proteger endpoints de gestión de órdenes de trabajo.
  - Validar autenticación del usuario.
  - Validar autorización según rol.
  - Validar rol: 
      Supervisor: crear, consultar, validar y cerrar formalmente OTs.
      Coordinador: asignar cuadrillas.
      Técnico: ejecutar, reportar avance, pausar y registrar información técnica.
      Backend: validar los permisos independientemente de las restricciones del frontend.
  - Permitir creación y gestión únicamente a usuarios autorizados.
  - Validar todos los datos recibidos en backend.
  - No confiar exclusivamente en las validaciones del frontend.
  - Impedir modificaciones de estados directamente desde el cliente sin pasar por las reglas de negocio.
  - Registrar el usuario responsable de las modificaciones relevantes.
  - Validar que la cuadrilla exista, se encuentre activa/disponible y pueda ser asignada a la OT.
  - Registrar en historial el usuario que ejecuta cada transición.

(M)

  * *Testing:*

  Unit tests backend:
    - Creación de una OT con datos válidos.
    - Validación de campos obligatorios.
    - Validación de código único.
    - Validación de activo existente o retirado.
    - Validación de tipo de mantenimiento.
    - Validación de prioridad.
    - Estado inicial PENDIENTE.
    - Transición EN_EJECUCION, PAUSADA.
    - Transición PAUSADA → EN_EJECUCION.
    - Validación del motivo de pausa.
    - Cancelación desde estados permitidos.
    - Actualización del estado del activo al iniciar y completar una OT.
    - Transiciones de estado permitidas.
    - Rechazo de transiciones inválidas.
    - Validación de cuadrilla para pasar a ASIGNADA.
    - Validación de resolución para pasar a COMPLETADA.
    - Validación de cancelación.
    - Validación de estados terminales.
    - Registro del historial de cambios.

  Unit tests frontend:
    - Renderizado del listado de OTs.
    - Renderizado de estados y prioridades.
    - Validaciones del formulario de creación.
    - Mensajes de error.
    - Filtros de OTs.
    - Visualización del detalle.
    - Mostrar únicamente las acciones de estado permitidas.
    - Validación de motivo obligatorio al cancelar.
    - Formulario de resolución.

  Tests de integración:
    - Crear una OT mediante API.
    - Consultar una OT mediante API.
    - Editar una OT.
    - Asignar una cuadrilla.
    - Cambiar el estado de la OT.
    - Completar una OT con resolución.
    - Cancelar una OT.
    - Rechazar una transición inválida.
    - Verificar persistencia en PostgreSQL.
    - Verificar historial de cambios.
    - Verificar contrato de endpoints mediante Supertest.

(L)

  * *Docker:*

  - Validar que la funcionalidad se ejecute correctamente en el entorno Docker existente.
  - Garantizar que el backend pueda ejecutar la gestión de OTs dentro del contenedor.
  - Garantizar la conexión entre backend y PostgreSQL.
  - Mantener las variables de entorno mediante configuración externa.
  - Mantener el volumen de PostgreSQL para conservar la información.
  - Verificar la ejecución completa mediante:
docker compose up

* **4. Estimación:** 

  - Modelo WorkOrder y WorkOrderHistory — S
  - API de órdenes de trabajo — M
  - Validaciones de negocio — M
  - Máquina de estados — M
  - Relaciones con activos y cuadrillas — M
  - Persistencia y restricciones — M
  - Historial de cambios — M
  - Listado de órdenes de trabajo — M
  - Formulario de creación — M
  - Edición de OT — S
  - Gestión visual de estados — M
  - Formulario de resolución — S
  - Búsqueda y filtros — S
  - Detalle de OT — S
  - Autenticación — S
  - Autorización por rol — M
  - Pruebas backend — M
  - Pruebas frontend — M
  - Pruebas de integración — M
  - Configuración Docker — S

* **5. Prioridad:** 

 * *MVP:*
  - Crear OTs asociadas a activos ITS existentes.
  - Consulta y filtrado de órdenes por estado, prioridad y tipo.
  - Consultar el detalle de una OT.
  - Asociar la OT con un activo ITS.
  - Definir tipo de mantenimiento preventivo o correctivo.
  - Definir prioridad.
  - Registrar descripción de la actividad.
  - Definir fecha programada.
  - Iniciar las OTs en estado PENDIENTE.
  - Gestionar las transiciones de estado permitidas.
  - Asociar una cuadrilla para pasar a ASIGNADA.
  - Iniciar la ejecución de la actividad.
  - Registrar información de resolución.
  - Completar una OT.
  - Cancelar una OT conservando su motivo.
  - Validar transiciones inválidas.
  - Registrar historial básico de cambios.
  - Aplicar autenticación y autorización.
  - Persistir la información en base de datos.
  - Realizar pruebas principales.

 * *Funcionalidades opcionales:*

  - Visualización tipo Kanban.
  - Programación avanzada de actividades.
  - Filtros por rangos de fecha de creación y cierre.
  - Adjuntar fotografías o documentos como evidencia.
  - Exportación de órdenes de trabajo.
  - Asociación detallada de materiales utilizados.
  - Integración con averías generadas automáticamente.
  - Alertas automáticas por órdenes vencidas o con prioridad crítica sin atender.
  - Notificaciones al asignar cuadrilla.

 * *Mejoras futuras:*

  - Generación automática de OTs preventivas según programación.
  - Generación automática de OTs a partir de eventos o averías.
  - Notificaciones automáticas a responsables.
  - Integración con sistemas de monitoreo ITS.
  - Programación inteligente basada en disponibilidad de cuadrillas.
  - Indicadores avanzados de cumplimiento y tiempos de mantenimiento.
  - Integración con sistemas externos de gestión de mantenimiento.
  - SLA y alertas por vencimiento.
  - Firma digital del técnico al cerrar.
  - Integración con calendario de cuadrillas.
  - Georreferenciación de la OT en el mapa del activo.

 * **6. Justificación:**

  - Se agregará WorkOrderHistory porque las órdenes de trabajo representan actividades operativas que deben conservar trazabilidad sobre sus cambios de estado, responsables y resultados.
  - Se agregará WorkOrder con un código único para permitir la identificación de cada orden de trabajo sin depender únicamente del identificador técnico de la base de datos.
  - Se estableció una relación obligatoria entre la orden de trabajo y Asset, ya que las actividades de mantenimiento deben poder identificar el activo ITS sobre el cual se ejecutan.
  - Se decidió usar una máquina de estados centralizada en lugar de validaciones dispersas, para evitar transiciones inválidas y facilitar pruebas unitarias sobre las reglas.
  - Se definieron los tipos PREVENTIVO y CORRECTIVO para representar los dos escenarios principales contemplados por la historia de usuario.
  - Se incorporó una prioridad (BAJA, MEDIA, ALTA, CRITICA) para permitir organizar las actividades según su nivel de atención requerido.
  - Se agregó una máquina de estados para controlar explícitamente el ciclo de vida de la OT y evitar modificaciones arbitrarias desde el frontend o directamente mediante solicitudes a la API.
  - Se incorporó el estado PAUSADA para representar interrupciones temporales durante la ejecución sin cerrar ni cancelar la OT.
  - Se definieron COMPLETADA y CANCELADA como estados terminales para conservar la trazabilidad y evitar modificar órdenes ya cerradas.
  - Se estableció la fecha programada como obligatoria para mantenimiento preventivo, ya que estas actividades requieren planificación.
---

### HU-003: Gestión de Cuadrillas

* **1. Análisis:**

  * *Ambigüedades:*

  - No se define qué información debe contener una cuadrilla.
  - No se establece si una cuadrilla debe tener un código único.
  - No se especifica si un técnico puede pertenecer a una única cuadrilla o a múltiples cuadrillas.
  - No se establece qué roles o funciones pueden tener los integrantes de una cuadrilla.
  - No se especifican los estados posibles de una cuadrilla.
  - No se especifica si una cuadrilla puede estar formada por un número fijo o variable de integrantes.
  - No se define cuándo una cuadrilla se considera disponible o no disponible.
  - No se define si una cuadrilla puede ser asignada a una OT CANCELADA o COMPLETADA.
  - No se establece qué sucede con una cuadrilla que ya tiene una OT EN_EJECUCION.
  - No se aclara si un técnico puede pertenecer a más de una cuadrilla.
  - No se define si una cuadrilla tiene una zona o corredor asignado de forma fija.
  - No se define si la disponibilidad de una cuadrilla depende de horario, ubicación, turno o capacidad técnica.
  - No se define si una cuadrilla puede atender simultáneamente varias OTs.
  - No se define si se requiere especialidad para asignar una cuadrilla a determinada OT.
  - No se especifica cómo se determina la disponibilidad de una cuadrilla.
  - No se establece qué sucede si una cuadrilla es dada de baja con OT activas.
  - No se aclara si la asignación de cuadrilla requiere aprobación del supervisor.
  - No se especifica si existe jerarquía dentro de la cuadrilla (líder, técnicos auxiliares).
  - No se define si la cuadrilla puede operar en varios corredores viales.
  - No se indica si existe control de jornada o turnos.
  - No se establece si el estado de la cuadrilla debe actualizarse automáticamente según sus OT.
  - No se define quién puede modificar la composición de una cuadrilla.
  - No se aclara si la cuadrilla se asigna a la OT o la OT se asigna a la cuadrilla.

  * *Dependencias:*

  - HU-001 Gestión de Activos: permite identificar los activos ITS relacionados con las OT.
  - HU-002 Gestión de Órdenes de Trabajo: proporciona las OT a las cuales se asignarán las cuadrillas.
  - Catálogo de especialidades técnicas.
  - Catálogo de estados de cuadrilla.
  - Catálogo de corredores viales (compartido con HU-001).
  - Sistema de autenticación y autorización.
  - Historial de asignaciones.
  - Estado de las OT.
  - Persistencia de asignaciones históricas entre cuadrillas y OTs.
  - Información de técnicos disponibles.
  - Entidad de usuario con rol coordinador.

  * *Riesgos:*

  - Que una cuadrilla sea asignada a dos OTs simultáneas en estado EN_EJECUCION.
  - Que una cuadrilla sea dada de baja teniendo OT activas sin reasignación.
  - Que se asignen cuadrillas sin verificar disponibilidad o especialidad.
  - Sobreasignar una misma cuadrilla a múltiples OT simultáneas.
  - Perder el historial de asignaciones
  - Que se pierda trazabilidad de qué cuadrilla ejecutó cada OT.
  - Que un técnico quede duplicado en varias cuadrillas sin control.
  - Que el estado de la cuadrilla no refleje la realidad operativa.
  - Que se asignen cuadrillas a OTs sobre activos fuera de su zona o especialidad.
  - Permitir modificaciones no autorizadas por parte de otros roles.
  - Que se modifique la composición de una cuadrilla durante la ejecución de una OT.
  - Que el dashboard (HU-004) muestre cuadrillas disponibles de forma incorrecta.
  - Que se elimine físicamente una cuadrilla con historial de OT.
  - Que una cuadrilla quede marcada como disponible cuando realmente está ejecutando una OT.
  - Que una cuadrilla quede bloqueada indefinidamente por una OT cancelada o finalizada.

  * *Supuestos:*

  - Una cuadrilla tiene un código único, un nombre, una especialidad y una zona/corredor asignado.
  - Una cuadrilla está formada por uno o varios técnicos, con un líder responsable.
  - El Coordinador de Operaciones se encuentra autenticado y autorizado para administrar cuadrillas.
  - Un técnico puede pertenecer a una sola cuadrilla activa a la vez.
  - Una cuadrilla puede tener varias OTs asignadas a lo largo del tiempo.
  - En el MVP, una cuadrilla no puede tener más de una OT en estado EN_EJECUCION simultáneamente.
  - Los estados del ciclo de vida del MVP son: DISPONIBLE, ASIGNADA, EN_EJECUCION, NO_DISPONIBLE e INACTIVA.
  - Una cuadrilla INACTIVA no puede recibir nuevas asignaciones.
  - El Coordinador de Operaciones es el rol autorizado para gestionar cuadrillas y asignarlas a OTs.
  - El Supervisor puede consultar las cuadrillas y su estado, pero no modificarlas.
  - La asignación de una cuadrilla se realiza únicamente sobre OTs existentes y en estados que permitan asignación.
  - Las asignaciones y cambios relevantes deben quedar registrados en un historial.
  - La baja de una cuadrilla es lógica mediante el estado INACTIVA, nunca física si tiene historial.
  - La especialidad puede ser: PMV, CCTV, METEO, SENSORES, AFORADORES o GENERAL.
  - Una cuadrilla solo puede asignarse a una OT si se encuentra en estado DISPONIBLE.
  - La sincronización de estados entre cuadrilla y OT es automática.
  - El técnico no gestiona cuadrillas directamente; participa en la ejecución de las OTs asignadas.
  - Se registra el usuario y la fecha en cada cambio de estado para garantizar la auditoría.

* **2. Refinamiento:**

  * *Entidades involucradas:*

  - Cuadrilla
  - Especialidad
  - Zona
  - Usuario
  - IntegranteCuadrilla
  - HistorialCuadrilla
  - HistorialAsignacionOT

    *Entidades relacionadas:*

    - OrdenTrabajo
    - ActivoITS

  * *Reglas de negocio:*

  - RN-01. Cada cuadrilla debe tener un código único dentro del sistema y no se permitirá registrar códigos duplicados.
  - RN-02. Toda cuadrilla debe tener un nombre, una especialidad y una zona asignada.
  - RN-03. Toda cuadrilla debe tener un líder responsable.
  - RN-04. Una cuadrilla debe tener al menos un técnico asignado.
  - RN-05. Un técnico no puede pertenecer a más de una cuadrilla activa simultáneamente.
  - RN-06. Toda nueva cuadrilla debe iniciar en estado DISPONIBLE.
  - RN-07. Una cuadrilla solo puede pasar a ASIGNADA cuando se le asigna una OT en estado PENDIENTE.
  - RN-08. Una cuadrilla solo puede pasar a EN_EJECUCION cuando su OT asociada pasa a EN_EJECUCION.
  - RN-09. Una cuadrilla vuelve a DISPONIBLE cuando su OT pasa a COMPLETADA o CANCELADA.
  - RN-10. Una cuadrilla solo podrá pasar a INACTIVA cuando no tenga OTs activas asociadas.
  - RN-11. Una cuadrilla INACTIVA no puede recibir nuevas asignaciones.
  - RN-12. No se permite la eliminación física de una cuadrilla con historial de OT.
  - RN-13. La especialidad de la cuadrilla debe pertenecer al catálogo autorizado.
  - RN-14. La zona asignada debe pertenecer al catálogo de corredores viales.
  - RN-15. Los cambios relevantes de una cuadrilla deben registrar fecha, usuario responsable y estado resultante.
  - RN-16. Una cuadrilla no puede tener más de una OT en EN_EJECUCION simultáneamente en el MVP.
  - RN-17. La asignación de una cuadrilla a una OT debe quedar registrada con fecha, usuario y código de OT.
  - RN-18. Toda modificación relevante de la cuadrilla debe generar un registro en el historial.
  - RN-19. La composición de una cuadrilla no puede modificarse mientras tenga una OT en EN_EJECUCION.

  * *Estados:*

  - Disponible (por defecto) Puede pasar a (Asignada, No Disponible, Inactiva)
  - Asignada Puede pasar a (En Ejecución, Disponible, No Disponible)
  - En Ejecución Puede pasar a (Disponible, No Disponible)
  - No Disponible  Puede pasar a (Disponible, Inactiva)
  - Inactiva (Terminal) (No puede cambiar de estado)

  * *Relaciones:*

  - Una cuadrilla puede atender múltiples OTs a lo largo del tiempo.
  - Una cuadrilla tiene un líder y varios técnicos.
  - Un técnico pertenece a una sola cuadrilla activa.
  - Una cuadrilla pertenece a una zona o corredor vial.
  - Una cuadrilla tiene una especialidad técnica.
  - Una cuadrilla puede tener múltiples registros históricos.
  - Una OT puede tener una cuadrilla asignada para su ejecución.

  * *Flujo funcional:*

![alt text](HU3.png)

* **Criterios de aceptación:**

  * *CA-01 — Crear cuadrilla*
  - Dado un coordinador autenticado con permiso,
  - Cuando registra una cuadrilla con código único, nombre, especialidad, zona y líder,
  - Entonces la cuadrilla se guarda en estado DISPONIBLE y se registra en el historial.

  * *CA-02 — Código único*
  - Dado que existe una cuadrilla con código `CUA-COR1-001`,
  - Cuando se intenta crear otra cuadrilla con el mismo código,
  - Entonces el sistema rechaza la operación con un error de unicidad.

  * *CA-03 — Técnico único por cuadrilla*
  - Dado un técnico ya asignado a una cuadrilla activa,
  - Cuando se intenta agregarlo a otra cuadrilla activa,
  - Entonces el sistema rechaza la operación.

  * *CA-04 — Asignar cuadrilla a OT*
  - Dado una cuadrilla en estado DISPONIBLE y una OT en estado PENDIENTE,
  - Cuando el coordinador asigna la cuadrilla a la OT,
  - Entonces la cuadrilla pasa a ASIGNADA, la OT pasa a ASIGNADA y se registra en el historial.

  * *CA-05 — Iniciar ejecución*
  - Dado una cuadrilla ASIGNADA y su OT asociada,
  - Cuando la OT pasa a EN_EJECUCION,
  - Entonces la cuadrilla pasa a EN_EJECUCION y se registra en el historial.

  * *CA-06 — Liberar cuadrilla*
  - Dado una cuadrilla EN_EJECUCION,
  - Cuando su OT pasa a COMPLETADA o CANCELADA,
  - Entonces la cuadrilla vuelve a DISPONIBLE y se registra en el historial.

  * *CA-07 — Baja con OT activas*
  - Dado una cuadrilla con OT activas,
  - Cuando se intenta darla de baja,
  - Entonces el sistema rechaza la operación hasta que las OTs activas sean finalizadas, canceladas o reasignadas según corresponda.

  * *CA-08 — Baja de cuadrilla*
  - Dado una cuadrilla DISPONIBLE sin OT activas,
  - Cuando el coordinador la da de baja,
  - Entonces la cuadrilla pasa a INACTIVA y no se elimina físicamente.

  * *CA-09 — Cuadrilla inactiva*
  - Dado una cuadrilla en estado INACTIVA,
  - Cuando se intenta asignarla a una nueva OT,
  - Entonces el sistema rechaza la operación.

  * *CA-10 — Historial*
  - Dado cualquier cambio relevante de una cuadrilla,
  - Cuando se consulta el detalle,
  - Entonces el historial muestra usuario, fecha y tipo de cambio.

* **3. Descomposición Técnica:**

  * *Backend:*

  - Crear modelo Cuadrilla.
  - Utilizar la entidad Usuario para representar a los técnicos integrantes de las cuadrillas.
  - Crear modelo IntegranteCuadrilla para gestionar la pertenencia de usuarios a las cuadrillas.
  - Crear modelo HistorialCuadrilla.
  - Crear modelo HistorialAsignacionOT.
  - Implementar servicio de gestión de cuadrillas.
  - Implementar controladores.
  - Crear endpoints CRUD.
  - Implementar validaciones de negocio.
  - Implementar gestión de cambios de estado.
  - Implementar registro de historial.
  - Implementar validación de técnicos únicos por cuadrilla activa.
  - Implementar validación de disponibilidad antes de asignar una OT.
  - Implementar integración con el servicio de Órdenes de Trabajo para sincronizar estados.
  - Implementar consulta de cuadrillas por estado, especialidad y zona.
  - Implementar bloqueo de modificación de composición cuando la cuadrilla se encuentre EN_EJECUCION.

  (L)

  * *Frontend:*

  - Crear vista de cuadrillas.
  - Crear listado con filtros por estado, especialidad y zona.
  - Crear formulario de registro.
  - Crear formulario de edición.
  - Crear detalle de cuadrilla con integrantes.
  - Crear selector de cuadrillas disponibles al asignar una OT.
  - Mostrar badges visuales para estados y especialidades.
  - Mostrar historial de asignaciones.
  - Mostrar mensajes de validación y errores provenientes del backend.

  (M)

  * *Persistencia:*

  - Crear las entidades y relaciones correspondientes.
  - Crear catálogos de especialidades y zonas.
  - Definir claves primarias y foráneas.
  - Crear índice único para cuadrillas.codigo.
  - Crear índices para estado, especialidad y zona.
  - Configurar migraciones.
  - Definir restricciones de integridad referencial.
  - Garantizar la persistencia del historial.
  - Evitar la eliminación física de cuadrillas con historial relacionado.

  (M)

  * *Seguridad:*

  - Proteger endpoints de gestión de cuadrillas.
  - Validar autenticación del usuario.
  - Validar autorización según rol.
  - Permitir al Coordinador crear, editar, asignar y dar de baja cuadrillas.
  - Permitir al Supervisor consultar cuadrillas y su estado.
  - Permitir al Técnico consultar la cuadrilla a la que pertenece.
  - Permitir modificaciones únicamente a usuarios autorizados.
  - Validar todos los datos recibidos en backend.
  - No confiar exclusivamente en las validaciones del frontend.
  - Impedir modificaciones de estados directamente desde el cliente sin pasar por las reglas de negocio.
  - Registrar el usuario responsable de las modificaciones relevantes.
  - Registrar en historial el usuario que ejecuta cada transición.

  (M)

  * *Testing:*

  Unit tests backend:
    - Validación de campos obligatorios.
    - Unicidad de código (RN-01).
    - Validación de técnico único por cuadrilla (RN-05).
    - Transiciones de estado permitidas (RN-06 a RN-11).
    - Baja lógica sin eliminación física (RN-12).
    - Bloqueo de asignación de cuadrilla INACTIVA (RN-11).
    - Bloqueo de baja con OT activas (RN-10).
    - Sincronización de estado con OT (RN-07 a RN-09).
    - Bloqueo de modificación de composición en EN_EJECUCION (RN-19).

  Unit tests frontend:
    - Renderizado del listado con filtros.
    - Mensajes de error en formulario.
    - Validaciones de campos obligatorios.
    - Selector de cuadrillas disponibles.
    - Visualización del detalle y del historial.
    - Mostrar únicamente las acciones de estado permitidas.

  Tests de integración:
    - Crear cuadrilla mediante API.
    - Asignar cuadrilla a OT.
    - Iniciar ejecución y verificar cambio de estado de cuadrilla.
    - Completar OT y verificar liberación de cuadrilla.
    - Dar de baja cuadrilla sin OT activas.
    - Rechazar baja con OT activas.
    - Rechazar asignación de cuadrilla INACTIVA.
    - Verificar persistencia en PostgreSQL.
    - Verificar contrato de endpoints mediante Supertest.

  (M)

  * *Docker:*

  - Validar que la funcionalidad se ejecute correctamente en el entorno Docker existente.
  - Garantizar que el backend pueda ejecutar la gestión de cuadrillas dentro del contenedor.
  - Garantizar la conexión entre backend y PostgreSQL.
  - Mantener las variables de entorno mediante configuración externa.
  - Mantener el volumen de PostgreSQL para conservar la información.
  - Verificar la ejecución completa mediante:
docker compose up

* **4. Estimación:**

  - Modelo Cuadrilla y IntegranteCuadrilla — S
  - Modelo HistorialCuadrilla y HistorialAsignacionOT S
  - Catálogo de especialidades y zonas — S
  - API de cuadrillas — M
  - Validaciones de negocio — M
  - Máquina de estados de cuadrilla — M
  - Integración con OT — M
  - Persistencia y relaciones — M
  - Historial de cambios — M
  - Listado de cuadrillas — M
  - Formulario de registro — M
  - Edición de cuadrilla — S
  - Detalle de cuadrilla con integrantes — S
  - Selector de cuadrillas disponibles — S
  - Búsqueda y filtros — S
  - Autenticación — S
  - Autorización por rol — M
  - Pruebas backend — M
  - Pruebas frontend — M
  - Pruebas de integración — M
  - Configuración Docker — S

* **5. Prioridad:**

  * *MVP:*

  - Crear cuadrillas con código único, nombre, especialidad, zona y líder.
  - Consultar el listado de cuadrillas.
  - Consultar el detalle de una cuadrilla.
  - Editar información de la cuadrilla.
  - Asignar técnicos a una cuadrilla.
  - Validar que un técnico pertenezca únicamente a una cuadrilla activa.
  - Gestionar el estado de la cuadrilla.
  - Asignar una cuadrilla a una OT en estado PENDIENTE.
  - Sincronizar el estado de la cuadrilla con el estado de la OT.
  - Realizar baja lógica mediante el estado INACTIVA.
  - Bloquear la baja cuando existan OTs activas.
  - Validar transiciones de estado inválidas.
  - Registrar historial básico de cambios.
  - Aplicar autenticación y autorización.
  - Persistir la información en base de datos.
  - Realizar pruebas principales.

  * *Funcionalidades opcionales:*

  - Gestión de turnos y jornadas.
  - Control de disponibilidad por franja horaria.
  - Asignación masiva de técnicos a cuadrillas.
  - Filtros por disponibilidad en tiempo real.
  - Notificaciones al asignar cuadrilla.
  - Reportes de carga de trabajo por cuadrilla.
  - Visualización tipo Kanban de cuadrillas.

  * *Mejoras futuras:*

  - Optimización automática de asignación según ubicación y especialidad.
  - Integración con calendario de cuadrillas.
  - Georreferenciación de cuadrillas en tiempo real.
  - Integración con sistemas de RRHH.
  - Indicadores avanzados de productividad por cuadrilla.
  - Firma digital del líder al cerrar OT.
  - Notificaciones push a los técnicos.
  - Integración con sistemas de control de asistencia.

* **6. Justificación:**

  - Se agregaron HistorialCuadrilla e HistorialAsignacionOT para conservar la trazabilidad de los cambios de estado, modificaciones y asignaciones de las cuadrillas, identificando cuándo y quién realizó cada acción.
  - Se utiliza Usuario para representar a los técnicos y IntegranteCuadrilla para gestionar su pertenencia a una cuadrilla, evitando duplicar la información de los usuarios en una entidad Tecnico independiente.
  - Se estableció una sola OT en EN_EJECUCION por cuadrilla para evitar sobreasignaciones y garantizar que el estado de disponibilidad represente la situación operativa real.
  - Se agregaron Especialidad y Zona como catálogos independientes para evitar datos escritos libremente y mantener valores controlados y consistentes.
  - La validación de compatibilidad entre la especialidad o zona de una cuadrilla y una OT se deja para una evolución futura, ya que actualmente las OTs no tienen definidos estos requerimientos específicos.
  - Se decidió sincronizar el estado de la cuadrilla con el estado de la OT para mantener coherencia entre ambos procesos y evitar que una cuadrilla figure como disponible mientras ejecuta una actividad.
  - Se definió la baja lógica mediante el estado INACTIVA en lugar de eliminar físicamente la cuadrilla, permitiendo conservar su historial y las relaciones con OTs anteriores.
  - Se estableció el bloqueo de baja cuando existen OTs activas para evitar retirar una cuadrilla que todavía tiene actividades pendientes de finalizar o reasignar.
  - Se determinó que un técnico solo pueda pertenecer a una cuadrilla activa a la vez para evitar conflictos en la asignación de responsabilidades y recursos.
  - Se bloquea la modificación de la composición de una cuadrilla mientras tiene una OT en EN_EJECUCION, garantizando que los integrantes registrados correspondan a quienes participaron durante la ejecución.
  - Se definió INACTIVA como estado terminal dentro del MVP para simplificar el ciclo de vida y evitar que una cuadrilla dada de baja pueda ser asignada nuevamente.
  - La gestión de turnos, jornadas y disponibilidad por franjas horarias se dejó como funcionalidad opcional porque requiere reglas adicionales de planificación y no es indispensable para cubrir el objetivo principal de la HU.

---


### HU-004: Dashboard Operacional

* **1. Análisis:**

  * *Ambigüedades:*

  - No se especifica qué indicadores debe mostrar el dashboard.
  - No se define si los indicadores corresponden únicamente al estado actual o también incluyen información histórica.
  - No se define la frecuencia de actualización de los indicadores.
  - No se establece si los indicadores se calculan directamente en cada consulta o mediante algún mecanismo de caché.
  - No se indica si el dashboard es configurable por el usuario.
  - No se especifica qué filtros estarán disponibles.
  - No se diferencia entre filtro por tipo de activo y tipo de mantenimiento.
  - No se define si el dashboard permitirá consultar información por corredor.
  - No se define la granularidad temporal de los indicadores.
  - No se aclara qué fecha de la Orden de Trabajo se utilizará para aplicar los filtros de período.
  - No se especifica si el dashboard será únicamente de consulta o permitirá navegar hacia los registros que originan los indicadores.
  - No se define si los indicadores podrán mostrar el detalle de las Órdenes de Trabajo asociadas.
  - No se especifica si se requieren gráficos, tarjetas KPI, tablas u otras representaciones visuales.
  - No se define si existen diferentes vistas del dashboard según el rol.
  - No se especifica si se permitirá exportar la información a PDF o Excel.
  - No se define si el dashboard tendrá actualización automática mediante polling o WebSocket.
  - No se establece qué significa exactamente "estado general" de las actividades de mantenimiento.
  - No se especifica si los activos RETIRADOS deben aparecer en los indicadores operacionales.
  - No se define cómo deben comportarse los indicadores cuando no existen datos.
  - No se establece si los módulos opcionales de inventario y averías harán parte del dashboard inicial.

  * *Dependencias:*

  - HU-001 Gestión de Activos: proporciona información de activos ITS, tipos, estados y corredores.
  - HU-002 Gestión de Órdenes de Trabajo: proporciona estados, tipos de mantenimiento, prioridades, fechas y relaciones con activos.
  - HU-003 Gestión de Cuadrillas: proporciona información sobre disponibilidad, asignaciones y estado de las cuadrillas.
  - HU-005 Gestión de Inventario (opcional): puede proporcionar indicadores relacionados con materiales y stock crítico.
  - HU-006 Gestión de Averías (opcional): puede proporcionar indicadores relacionados con averías activas.
  - Sistema de autenticación y autorización.
  - Base de datos con información persistida de los módulos fuente.
  - Catálogos de tipos de activo, estados, prioridades, tipos de mantenimiento y corredores.
  - Servicios o consultas agregadas para consolidar la información.
  - Índices de base de datos que permitan realizar consultas agregadas de manera eficiente.

  * *Riesgos:*

  - Consultas agregadas costosas que degraden el rendimiento del sistema.
  - Indicadores inconsistentes respecto a los datos mostrados en los módulos fuente.
  - Errores en los cálculos debido a reglas diferentes entre backend y frontend.
  - Datos desactualizados sin informar al usuario la fecha de consulta o actualización.
  - Filtros aplicados de forma diferente entre los distintos indicadores.
  - Manejo incorrecto de rangos de fechas y zonas horarias.
  - Información incompleta cuando alguno de los módulos fuente todavía no tiene datos.
  - Que el dashboard dependa de módulos opcionales que no estén habilitados.
  - Que se incluyan activos RETIRADOS en indicadores operacionales y se distorsione el estado actual.
  - Que las OT CANCELADAS sean interpretadas como carga operativa vigente.
  - Que la información de cuadrillas no coincida con las asignaciones reales de las OT.
  - Sobrecarga de la base de datos ante múltiples consultas simultáneas.
  - Indicadores difíciles de interpretar por exceso de información visual.
  - Exposición de información no autorizada a usuarios que no tengan permisos para consultar el dashboard.

  * *Supuestos:*

  - El dashboard será principalmente de consulta y no modificará activos, órdenes de trabajo ni cuadrillas.
  - El acceso al dashboard completo estará disponible para usuarios con rol supervisor y coordinador.
  - El técnico no tendrá acceso al dashboard operacional general.
  - Los indicadores serán calculados en el backend y expuestos mediante API REST.
  - Los indicadores utilizarán como fuente los datos persistidos de los módulos correspondientes.
  - En el MVP se priorizarán indicadores operacionales estándar y no un dashboard completamente configurable.
  - El dashboard contará con filtros por corredor y rango de fechas.
  - El tipo de activo y el tipo de mantenimiento se tratarán como filtros independientes cuando sean implementados.
  - Para los indicadores basados en período, se utilizará inicialmente la fecha de creación de la Orden de Trabajo como referencia temporal.
  - El usuario podrá realizar una actualización manual de los datos mostrados.
  - El sistema informará la fecha y hora de la última actualización de los datos consultados.
  - Los activos RETIRADOS no harán parte de los indicadores operacionales actuales.
  - Las OT CANCELADAS no se considerarán trabajo pendiente ni carga operativa activa.
  - Las OT COMPLETADAS se utilizarán para indicadores históricos o de volumen realizado.
  - Las cuadrillas INACTIVAS no se considerarán disponibles.
  - Los indicadores de inventario y averías solo se mostrarán si dichos módulos están implementados y habilitados.
  - El dashboard funcionará aunque alguno de los módulos opcionales no exista o no tenga información.
  - No se implementará exportación de reportes en el MVP.
  - La actualización automática mediante polling o WebSocket se considera opcional.
  - Los indicadores serán derivados de la información existente y no se almacenarán como entidades independientes en la base de datos.

* **2. Refinamiento:**

  * *Entidades involucradas:*

  - Usuario
  - ActivoITS
  - OrdenTrabajo
  - Cuadrilla
  - HistorialOrdenTrabajo (para consultar información histórica cuando sea necesario)

    *Entidades relacionadas:*

    - TipoActivo
    - TipoMantenimiento
    - PrioridadOT
    - Zona / Corredor
    - Material (opcional, dependiendo de HU-005)
    - Averia (opcional, dependiendo de HU-006)

    > No se crea una entidad `IndicadorDashboard` ni `IndicadorSnapshot` para el MVP, debido a que los indicadores son valores derivados de las entidades operacionales existentes. El dashboard consume y agrega estos datos mediante servicios de consulta.

  * *Reglas de negocio:*

  - RN-01. Solo usuarios autenticados con rol SUPERVISOR o COORDINADOR pueden acceder al dashboard operacional.
  - RN-02. Los indicadores deben calcularse en el backend para centralizar las reglas de cálculo y garantizar consistencia con los módulos fuente.
  - RN-03. Los indicadores deben utilizar información persistida de los módulos de Activos, Órdenes de Trabajo y Cuadrillas.
  - RN-04. Los activos en estado RETIRADO no deben contabilizarse dentro de los indicadores operacionales actuales.
  - RN-05. Los activos en estado INACTIVO, si este estado existe en el modelo definitivo, no deben considerarse activos operativos.
  - RN-06. Las OT en estado CANCELADA no deben contabilizarse como trabajo pendiente ni como carga operativa activa.
  - RN-07. Las OT en estado COMPLETADA deben considerarse finalizadas y pueden incluirse en indicadores históricos o de trabajo realizado.
  - RN-08. Las OT en estado PENDIENTE, ASIGNADA, EN_EJECUCION y PAUSADA representan actividades que aún forman parte del ciclo operativo de mantenimiento.
  - RN-09. Las cuadrillas en estado INACTIVA no deben contabilizarse como cuadrillas disponibles.
  - RN-10. La carga actual de una cuadrilla se define en el MVP como la cantidad de Órdenes de Trabajo activas asociadas a ella.
  - RN-11. Los indicadores de disponibilidad de cuadrillas deben respetar los estados definidos en HU-003.
  - RN-12. Los filtros seleccionados por el usuario deben aplicarse de forma consistente a todos los indicadores que sean compatibles con dichos filtros.
  - RN-13. El filtro por período utilizará inicialmente la fecha de creación de la Orden de Trabajo como referencia temporal.
  - RN-14. Los rangos de fechas deben interpretarse utilizando una zona horaria definida por el sistema para evitar inconsistencias en los resultados.
  - RN-15. El dashboard debe mostrar la fecha y hora correspondiente a la última actualización de los datos consultados.
  - RN-16. El dashboard no permitirá modificar directamente los datos de Activos, Órdenes de Trabajo o Cuadrillas.
  - RN-17. Los indicadores deben ser consistentes con la información disponible en los módulos fuente.
  - RN-18. Los indicadores relacionados con módulos opcionales solo deben mostrarse cuando el módulo correspondiente esté habilitado.
  - RN-19. La ausencia de información en un módulo no debe provocar un error general del dashboard.
  - RN-20. Cuando no existan registros para un indicador, el sistema debe mostrar un valor cero o un estado vacío claramente identificado, según corresponda.
  - RN-21. Los indicadores no deben exponer información personal o sensible de los usuarios, técnicos o integrantes de cuadrillas.
  - RN-22. Los cambios de estado de activos, OT o cuadrillas deben reflejarse en los indicadores cuando se realice una nueva consulta o actualización del dashboard.
  - RN-23. El dashboard no debe modificar ni duplicar las reglas de transición de estados definidas en HU-001, HU-002 y HU-003.
  - RN-24. Las consultas agregadas deben ejecutarse mediante mecanismos optimizados para evitar afectar innecesariamente el rendimiento de los módulos operacionales.

  * *Estados:*

  El dashboard no posee estados propios, debido a que funciona como una vista de consulta y consolidación. Los indicadores reflejan los estados de las entidades operacionales:

  Activos ITS:
  - Operativo
  - En Mantenimiento
  - Fuera de Servicio
  - Retirado

  Órdenes de Trabajo:
  - Pendiente
  - Asignada
  - En Ejecución
  - Pausada
  - Completada
  - Cancelada

  Cuadrillas:
  - Disponible
  - Asignada
  - En Ejecución
  - No Disponible
  - Inactiva

  > El dashboard no cambia estos estados. Únicamente los consulta y consolida.

  * *Relaciones:*

  - Un Usuario autorizado puede consultar múltiples indicadores del dashboard.
  - Un ActivoITS puede estar relacionado con múltiples Órdenes de Trabajo.
  - Una OrdenTrabajo pertenece a un ActivoITS y posee un tipo de mantenimiento, prioridad y estado.
  - Una OrdenTrabajo puede estar asociada a una Cuadrilla.
  - Una Cuadrilla puede tener una o varias OT activas según las reglas establecidas en HU-003.
  - Un indicador puede realizar agregaciones sobre múltiples registros de una misma entidad.
  - Un indicador de OT puede utilizar información relacionada de Activos y Cuadrillas.
  - Un filtro puede afectar uno o varios indicadores dependiendo de la relación entre los datos.
  - Los módulos opcionales de Inventario y Averías pueden aportar indicadores adicionales sin convertirse en dependencias obligatorias del dashboard.

  * *Flujo funcional:*
  ![alt text](HU4.png)

* **Criterios de aceptación:**

  * *CA-01 — Acceso al dashboard*
  - Dado un usuario autenticado con rol supervisor o coordinador,
  - Cuando ingresa al módulo Dashboard Operacional,
  - Entonces el sistema permite el acceso y muestra los indicadores disponibles.

  * *CA-02 — Acceso no autorizado*
  - Dado un usuario con rol técnico,
  - Cuando intenta acceder al Dashboard Operacional,
  - Entonces el sistema rechaza el acceso.

  * *CA-03 — Indicadores de activos*
  - Dado que existen activos ITS registrados,
  - Cuando se carga el dashboard,
  - Entonces el sistema muestra los indicadores de activos por estado y, cuando corresponda, por tipo y corredor,
  - Y excluye los activos RETIRADO de los indicadores operacionales actuales.

  * *CA-04 — Indicadores de Órdenes de Trabajo*
  - Dado que existen Órdenes de Trabajo registradas,
  - Cuando se carga el dashboard,
  - Entonces el sistema muestra los conteos correspondientes a sus estados,
  - Y permite identificar la distribución por tipo de mantenimiento y prioridad.

  * *CA-05 — Estados de OT*
  - Dado que existen OT en diferentes estados,
  - Cuando se consulta el indicador por estado,
  - Entonces el sistema diferencia correctamente PENDIENTE, ASIGNADA, EN_EJECUCION, PAUSADA, COMPLETADA y CANCELADA.

  * *CA-06 — Indicadores de cuadrillas*
  - Dado que existen cuadrillas registradas,
  - Cuando se carga el dashboard,
  - Entonces el sistema muestra la distribución de cuadrillas por estado,
  - Y muestra la carga actual cuando la información de asignaciones esté disponible.

  * *CA-07 — Definición de carga*
  - Dado una cuadrilla con Órdenes de Trabajo activas,
  - Cuando se consulta su carga,
  - Entonces el sistema muestra la cantidad de OT activas asociadas a la cuadrilla.

  * *CA-08 — Filtro por corredor*
  - Dado un dashboard con información,
  - Cuando el usuario selecciona un corredor,
  - Entonces los indicadores compatibles se recalculan utilizando únicamente la información correspondiente a dicho corredor.

  * *CA-09 — Filtro por rango de fechas*
  - Dado un dashboard con información,
  - Cuando el usuario selecciona un rango de fechas,
  - Entonces los indicadores relacionados con las Órdenes de Trabajo utilizan la fecha de creación de la OT para determinar los registros incluidos.

  * *CA-10 — Actualización de información*
  - Dado un dashboard cargado,
  - Cuando el usuario solicita actualizar la información,
  - Entonces el sistema vuelve a consultar los datos y actualiza los indicadores.

  * *CA-11 — Última actualización*
  - Dado un dashboard cargado correctamente,
  - Cuando el usuario consulta la información de actualización,
  - Entonces el sistema muestra la fecha y hora de la última consulta o actualización de datos.

  * *CA-12 — Sin datos*
  - Dado que no existen registros en alguno de los módulos consultados,
  - Cuando se carga el dashboard,
  - Entonces el sistema muestra un valor cero o estado vacío informativo,
  - Y no genera un error general de la aplicación.

  * *CA-13 — Módulos opcionales*
  - Dado que un módulo opcional no está habilitado,
  - Cuando se carga el dashboard,
  - Entonces los indicadores asociados a dicho módulo no se muestran,
  - Y el resto del dashboard continúa funcionando normalmente.

  * *CA-14 — Consistencia*
  - Dado un indicador mostrado en el dashboard,
  - Cuando se compara con los registros del módulo fuente utilizando los mismos filtros,
  - Entonces los valores obtenidos deben ser consistentes.

  * *CA-15 — Solo consulta*
  - Dado un usuario dentro del dashboard,
  - Cuando consulta cualquier indicador,
  - Entonces el dashboard no modifica activos, órdenes de trabajo ni cuadrillas.

  * *CA-16 — Seguridad*
  - Dado un usuario sin permisos para consultar el dashboard,
  - Cuando intenta acceder directamente al endpoint,
  - Entonces el backend rechaza la solicitud aunque el usuario intente acceder sin utilizar la interfaz gráfica.

* **3. Descomposición Técnica:**

  * *Backend:*

  - Implementar módulo o servicio `DashboardService`.
  - Implementar endpoint consolidado `GET /api/dashboard/summary`.
  - Implementar endpoints separados por dominio:
    - `GET /api/dashboard/assets`
    - `GET /api/dashboard/work-orders`
    - `GET /api/dashboard/crews`
  - Implementar consultas agregadas sobre Activos, OT y Cuadrillas.
  - Implementar filtros por corredor y rango de fechas.
  - Preparar soporte para filtros adicionales de tipo de activo y tipo de mantenimiento.
  - Implementar cálculo centralizado de indicadores.
  - Implementar exclusión de estados que no correspondan a indicadores operacionales.
  - Implementar manejo de módulos opcionales.
  - Implementar respuesta uniforme para estados vacíos.
  - Implementar metadata de fecha/hora de actualización.
  - Optimizar consultas mediante índices y agregaciones.
  - Evitar duplicar cálculos de indicadores en frontend.
  - Preparar el servicio para incorporar caché si el volumen de información lo requiere.

  (L)

  * *Frontend:*

  - Crear vista Dashboard Operacional.
  - Crear componentes reutilizables para KPIs.
  - Crear componentes para gráficos.
  - Crear sección de indicadores de Activos.
  - Crear sección de indicadores de Órdenes de Trabajo.
  - Crear sección de indicadores de Cuadrillas.
  - Crear filtros por corredor.
  - Crear filtro de rango de fechas.
  - Preparar filtros adicionales de tipo de activo y tipo de mantenimiento.
  - Mostrar fecha/hora de última actualización.
  - Implementar botón de actualización manual.
  - Implementar estados de carga.
  - Implementar estados vacíos.
  - Implementar manejo de errores.
  - Implementar diseño responsive.
  - Evitar bloqueo de la interfaz durante la carga de información.

  (M)

  * *Persistencia:*

  - Reutilizar las tablas existentes de ActivoITS, OrdenTrabajo, Cuadrilla e HistorialOrdenTrabajo.
  - Revisar índices necesarios para las consultas agregadas.
  - Crear índices sobre campos utilizados frecuentemente en filtros y agrupaciones.
  - Evaluar índices sobre: estado, tipo, prioridad, fecha de creación, activo, cuadrilla y corredor/zona.
  - Garantizar integridad referencial entre OT, Activos y Cuadrillas.
  - Crear migraciones únicamente para los índices o ajustes realmente necesarios.
  - No crear una tabla IndicadorDashboard en el MVP.
  - No persistir snapshots de indicadores en el MVP.
  - Evaluar vistas materializadas únicamente si el volumen de información demuestra que son necesarias.

  (M)

  * *Seguridad:*

  - Proteger los endpoints del dashboard mediante autenticación.
  - Validar autorización según rol.
  - Permitir acceso al dashboard a supervisor y coordinador.
  - Rechazar acceso a técnicos.
  - Aplicar autorización también en backend, no solamente en frontend.
  - Validar parámetros recibidos en filtros.
  - Evitar exposición de información sensible de usuarios.
  - Mantener separación entre datos de consulta y operaciones de modificación.
  - Registrar eventos de acceso si posteriormente se requiere auditoría.

  (M)

  * *Testing:*

  Unit tests backend:
    - Cálculo correcto de indicadores de activos.
    - Exclusión de activos RETIRADO.
    - Cálculo correcto de indicadores de OT.
    - Diferenciación de estados de OT.
    - Exclusión de OT CANCELADA del trabajo pendiente.
    - Inclusión correcta de OT COMPLETADA en indicadores históricos.
    - Cálculo correcto de carga de cuadrillas.
    - Exclusión de cuadrillas INACTIVA de disponibilidad.
    - Aplicación correcta del filtro por corredor.
    - Aplicación correcta del rango de fechas.
    - Manejo de ausencia de datos.
    - Validación de módulos opcionales.
    - Validación de permisos por rol.

  Unit tests frontend:
    - Renderizado correcto de KPIs.
    - Renderizado de gráficos.
    - Aplicación de filtros.
    - Actualización manual.
    - Indicador de última actualización.
    - Estado de carga.
    - Estado vacío.
    - Estado de error.
    - Restricción visual para usuarios no autorizados.

  Tests de integración:
    - Consulta general del dashboard.
    - Consulta con filtros.
    - Consistencia entre dashboard y módulos fuente.
    - Verificación de estados de OT.
    - Verificación de carga de cuadrillas.
    - Verificación de autorización de endpoints.
    - Verificación de respuesta cuando no existen datos.
    - Verificación del contrato de los endpoints.

  (L)

  * *Docker:*

  - Validar que el dashboard funcione correctamente en el entorno Docker existente.
  - Verificar conexión entre backend y PostgreSQL.
  - Mantener las variables de entorno mediante configuración externa.
  - No almacenar credenciales directamente en la imagen.
  - Verificar que las consultas agregadas funcionen dentro del contenedor.
  - Mantener el volumen de PostgreSQL existente.
  - Validar la ejecución completa del sistema mediante:
docker compose up

  (S)

* **4. Estimación:**

  - DashboardService y lógica de agregación — M
  - Endpoint consolidado `/summary` — M
  - Endpoints específicos por dominio — M
  - Filtros por corredor y fechas — M
  - Consultas agregadas — M
  - Optimización de consultas e índices — M
  - Vista principal Dashboard — M
  - Componentes KPI — S
  - Gráficos — M
  - Filtros — S
  - Indicador de última actualización — XS
  - Actualización manual — XS
  - Estados de carga — XS
  - Estados vacíos — XS
  - Manejo de errores — S
  - Autenticación — S
  - Autorización por rol — M
  - Manejo de módulos opcionales — S
  - Pruebas backend — M
  - Pruebas frontend — M
  - Pruebas de integración — L
  - Configuración / validación Docker — S

  Estimación general de la HU: L

  La HU se considera L porque requiere integrar información de tres módulos previamente definidos, realizar consultas agregadas, aplicar filtros, controlar autorización y validar consistencia entre diferentes fuentes de datos.

* **5. Prioridad:**

  * *MVP:*

  - Acceso al dashboard para supervisor y coordinador.
  - Indicadores de Activos ITS.
  - Indicadores de OT por estado.
  - Indicadores de OT por tipo de mantenimiento.
  - Indicadores de OT por prioridad.
  - Indicadores de Cuadrillas por estado.
  - Indicador de carga actual de cuadrillas.
  - Filtro por corredor.
  - Filtro por rango de fechas.
  - Actualización manual.
  - Fecha/hora de última actualización.
  - Estados de carga.
  - Estados vacíos informativos.
  - Manejo de errores.
  - Consistencia con módulos fuente.
  - Autenticación y autorización.
  - Consultas optimizadas.
  - Pruebas principales de backend, frontend e integración.

  * *Funcionalidades opcionales:*

  - Indicadores de Inventario provenientes de HU-005.
  - Indicadores de Averías provenientes de HU-006.
  - Filtro por tipo de activo.
  - Filtro por tipo de mantenimiento.
  - Gráficos de tendencia temporal.
  - Drill-down desde un indicador hacia el listado correspondiente.
  - Exportación a PDF.
  - Exportación a Excel.
  - Actualización automática mediante polling.
  - Indicadores de distribución de carga por cuadrilla.

  * *Mejoras futuras:*

  - Dashboard configurable por usuario.
  - Vistas personalizadas según rol.
  - Comparativas entre diferentes períodos.
  - Indicadores predictivos.
  - Métricas de SLA.
  - Tiempo medio de atención de OT.
  - Tiempo medio de resolución.
  - Indicadores de desempeño de mantenimiento.
  - Notificaciones cuando un indicador supere un umbral.
  - Mapas de calor por corredor.
  - Integración con sistemas externos de monitoreo ITS.
  - Actualización en tiempo real mediante WebSocket.
  - Snapshots históricos persistidos.
  - Integración con herramientas externas de BI.

* **6. Justificación:**

  - Dashboard de consulta: Se definió como consulta en el MVP porque las modificaciones corresponden a los módulos de Activos, Órdenes de Trabajo y Cuadrillas.
  - Cálculo en backend: Se centralizaron los cálculos en el backend para mantener reglas de cálculo consistentes y evitar duplicidad en el frontend.
  - Sin IndicadorDashboard ni IndicadorSnapshot: No se crearon porque los indicadores son datos derivados de los módulos existentes y no requieren persistencia independiente en el MVP.
  - Última actualización: Se incluyó para que el usuario conozca la fecha y hora de los datos consultados.
  - Actualización manual: Se priorizó para mantener simple el MVP y evitar inicialmente mecanismos como WebSocket o polling.
  - Filtro por corredor: Se incluyó porque permite consultar la operación de un corredor vial específico.
  - Filtro por fechas: Se incluyó para analizar las actividades de mantenimiento de un período determinado, usando la fecha de creación de la OT como referencia inicial.
  - Tipo de activo vs. tipo de mantenimiento: Se diferenciaron porque representan conceptos distintos: el primero identifica el activo y el segundo clasifica la OT como preventiva o correctiva.
  - Activos `RETIRADO`: Se excluyeron de los indicadores operacionales porque ya no representan infraestructura activa.
  - OT `CANCELADA`: Se excluyeron de la carga pendiente porque ya no requieren atención operativa.
  - OT `COMPLETADA`: Se conservaron como información histórica para representar el trabajo realizado.
  - Carga de cuadrilla: Se definió como la cantidad de OT activas asociadas para mantener un cálculo simple en el MVP.
  - Dependencia de HU-003: Se mantuvo la gestión de cuadrillas en HU-003 para evitar duplicar sus reglas dentro del dashboard.
  - Inventario y Averías opcionales: Se mantuvieron como dependencias opcionales para que el dashboard funcione aunque dichos módulos no estén implementados.
  - Indicadores estándar: Se priorizaron para reducir la complejidad inicial y validar primero las necesidades básicas de la operación.
  - Drill-down opcional: Se dejó como opcional porque la visualización de indicadores cumple el objetivo principal del MVP.
  - Exportación opcional/futura: Se dejó fuera del núcleo del MVP porque corresponde a necesidades adicionales de reporting.
  - Análisis predictivo futuro: Se reservó para una etapa posterior porque requiere mayor cantidad de datos históricos y modelos adicionales.
  - Dashboard como consumidor: HU-004 consume información de HU-001, HU-002 y HU-003 sin modificar sus reglas de negocio.
  - Optimización antes que snapshots: Se priorizaron consultas e índices antes de implementar mecanismos de persistencia de indicadores, debido a que el volumen inicial no justifica mayor complejidad.
  - Pruebas de consistencia: Se incluyeron para garantizar que los indicadores coincidan con la información de los módulos fuente.
  - Autorización en backend: Se mantuvo porque la seguridad no debe depender únicamente de restricciones en el frontend.
  - Estados vacíos: Se incluyeron para diferenciar la ausencia de datos de un error del sistema.


### Preguntas de Reflexión

  -  *¿Qué entidades son necesarias?*

      * Las entidades necesarias son:

      -  ActivoITS: representa los activos de la infraestructura vial, como PMV, CCTV, estaciones meteorológicas, sensores de tráfico y aforadores.
      -  TipoActivo: catálogo de tipos de activos ITS.
      -  Ubicación/Zona: permite identificar el corredor y ubicación del activo.
      -  OrdenTrabajo: representa las actividades de mantenimiento preventivo o correctivo.
      -  TipoMantenimiento: diferencia mantenimiento preventivo y correctivo.
      -  Cuadrilla: representa el equipo encargado de ejecutar las órdenes de trabajo.
      -  Usuario: representa los actores del sistema y sus permisos.
      -  IntegranteCuadrilla: relaciona técnicos con cuadrillas.
      -  HistorialActivo: registra cambios relevantes realizados sobre los activos.
      -  HistorialOrdenTrabajo: permite mantener la trazabilidad de las órdenes.
      -  HistorialCuadrilla: registra cambios relevantes de las cuadrillas.
      -  HistorialAsignacionOT: registra las asignaciones de cuadrillas a órdenes de trabajo.

  -  *¿Qué estados debería tener una Orden de Trabajo?*

      La Orden de Trabajo debería manejar los siguientes estados: (PENDIENTE -> ASIGNADA -> EN_EJECUCION -> COMPLETADA)
      Durante la ejecución también puede pasar temporalmente por: (EN_EJECUCION -> PAUSADA -> EN_EJECUCION)
      Además, una orden puede pasar a: CANCELADA

  -  *¿Qué información requiere una Cuadrilla?*
     
     Una Cuadrilla Requiere de : 
      Código único.
      Nombre.
      Especialidad.
      Corredor o zona de operación.
      Estado.
      Líder de cuadrilla.
      Técnicos integrantes.
      Historial de asignaciones.
      Órdenes de trabajo asociadas.

  -  *¿Cómo se controla el consumo de inventario?*

        Cuando un técnico utiliza un material durante una actividad, el consumo debería registrar, como mínimo: 
        (Material utilizado - Orden de trabajo asociada -Cantidad utilizada - Fecha del consumo - Usuario que registra el consumo)
        El sistema debería validar que exista disponibilidad suficiente antes de registrar el consumo y actualizar el stock correspondiente.

  -  *¿Cómo se relacionan los activos con las actividades de mantenimiento?*

        Cuando una actividad de mantenimiento comienza, el estado del activo puede pasar a EN_MANTENIMIENTO, y al finalizar correctamente puede regresar a OPERATIVO.

  -  *¿Qué indicadores son importantes para un supervisor?*

        Los indicadores importantes para el supervior son: 

          *Total de activos*
          Activos OPERATIVOS.
          Activos EN_MANTENIMIENTO.
          Activos FUERA_DE_SERVICIO.
          Activos RETIRADOS.

          *Total de órdenes*
          Órdenes PENDIENTES.
          Órdenes ASIGNADAS.
          Órdenes EN_EJECUCION.
          Órdenes PAUSADAS.
          Órdenes COMPLETADAS.
          Órdenes CANCELADAS.
          Distribución entre mantenimiento preventivo y correctivo.
          Distribución por prioridad.

         *Cuadrillas disponibles*
          Cuadrillas asignadas.
          Cuadrillas en ejecución.
          Cuadrillas no disponibles.
          Carga actual de cada cuadrilla mediante el número de órdenes activas.


---