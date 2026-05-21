# HISTORIAS DE USUARIO SISTEMA GENERAL

## Alcance vigente

Las historias de usuario de este documento corresponden al sistema de gestion de pedidos de `practica31testing`.

El alcance vigente contempla una unica epica de producto:

- WEBADMIN DE PEDIDOS

Las historias reflejan funcionalidades reales del sistema actual y se redactan para planificacion Scrum.

## Escala de estimacion

Cada punto de historia equivale a 4 horas.
Solo se utiliza la serie Fibonacci 1, 3, 5 y 8.
Para este documento se usan estimaciones entre 3 y 8 puntos.
Si una historia supera 8 puntos, debe dividirse.

## HU-01. Inicio de sesion y control de acceso

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Seguridad y acceso
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: Ninguna

COMO usuario interno autorizado
QUIERO iniciar sesion y ver solo las opciones permitidas para mi rol
PARA trabajar de forma segura dentro del panel

CRITERIOS DE ACEPTACION
- GIVEN un usuario activo con rol `ADMINISTRADOR` o `AYUDANTE` WHEN ingresa credenciales validas THEN el sistema permite el acceso
- GIVEN una ruta sin permiso para el rol actual WHEN se intenta acceder manualmente THEN el sistema bloquea la navegacion y muestra una vista de no autorizado
- GIVEN una sesion valida WHEN el usuario entra al panel THEN el sistema muestra su nombre, rol y opciones visibles acordes a sus permisos

## HU-02. Gestion de roles del sistema

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Roles
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: HU-01

COMO administrador
QUIERO administrar el catalogo de roles
PARA mantener controlado el acceso de los usuarios internos

CRITERIOS DE ACEPTACION
- GIVEN el formulario de roles WHEN se registran datos validos THEN el sistema guarda el rol correctamente
- GIVEN un rol existente WHEN se actualiza o cambia su estado THEN el sistema conserva historial y actualiza su disponibilidad
- GIVEN un rol duplicado o vinculado a usuarios WHEN se intenta registrar o eliminar THEN el sistema informa la restriccion correspondiente

## HU-03. Gestion de empleados

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Empleados
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: HU-01

COMO administrador
QUIERO registrar y administrar empleados
PARA contar con personal base para la operacion del sistema

CRITERIOS DE ACEPTACION
- GIVEN el formulario de empleados WHEN se registran datos validos THEN el sistema guarda el empleado correctamente
- GIVEN un empleado existente WHEN se actualizan sus datos THEN el sistema conserva el historial y modifica solo la informacion permitida
- GIVEN un empleado con usuarios o pedidos relacionados WHEN se intenta eliminar THEN el sistema bloquea la eliminacion fisica

## HU-04. Gestion de usuarios internos

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Usuarios
- PUNTOS DE HISTORIA: 8
- TIEMPO ESTIMADO: 32 horas
- DEPENDE DE: HU-01, HU-02, HU-03

COMO administrador
QUIERO crear y administrar usuarios asociados a empleados y roles
PARA controlar quien puede operar dentro del panel

CRITERIOS DE ACEPTACION
- GIVEN un empleado activo y un rol activo WHEN se crea un usuario THEN el sistema genera automaticamente el nombre de usuario, la contrasenia inicial y guarda la contrasenia cifrada
- GIVEN un usuario existente WHEN se actualiza su informacion o contrasenia THEN el sistema conserva el historial y vuelve a cifrar la contrasenia si fue cambiada
- GIVEN un usuario autenticado WHEN inicia sesion THEN el sistema actualiza su ultima fecha de acceso

## HU-05. Gestion de clientes

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Clientes
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: HU-01

COMO administrador o ayudante
QUIERO registrar y administrar clientes
PARA utilizarlos en los pedidos del negocio

CRITERIOS DE ACEPTACION
- GIVEN el formulario de clientes WHEN se registran datos validos THEN el sistema guarda el cliente correctamente
- GIVEN un cliente existente WHEN se actualizan sus datos THEN el sistema conserva el historial y modifica la informacion permitida
- GIVEN un cliente con pedidos relacionados WHEN se intenta eliminar THEN el sistema bloquea la eliminacion fisica

## HU-06. Gestion de productos con imagen

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Productos
- PUNTOS DE HISTORIA: 8
- TIEMPO ESTIMADO: 32 horas
- DEPENDE DE: HU-01

COMO administrador o ayudante
QUIERO registrar y administrar productos con imagen y stock
PARA disponer de un catalogo util para las ventas

CRITERIOS DE ACEPTACION
- GIVEN un producto nuevo WHEN se registran datos validos THEN el sistema guarda codigo, nombre, precio, stock e imagen opcional
- GIVEN una imagen valida WHEN se carga desde el formulario THEN el backend la almacena en Supabase Storage y actualiza sus metadatos en la tabla producto
- GIVEN un producto usado en detalles de pedido WHEN se intenta eliminar THEN el sistema bloquea la eliminacion fisica

## HU-07. Registro de pedidos

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Pedidos
- PUNTOS DE HISTORIA: 8
- TIEMPO ESTIMADO: 32 horas
- DEPENDE DE: HU-03, HU-05

COMO administrador o ayudante
QUIERO registrar la cabecera de un pedido
PARA preparar la venta y luego gestionar sus productos

CRITERIOS DE ACEPTACION
- GIVEN un cliente activo y un empleado activo WHEN se crea un pedido THEN el sistema genera automaticamente el codigo `PEDIDO-N` y lo deja en estado `PENDIENTE`
- GIVEN una fecha programada WHEN se guarda el pedido THEN el sistema exige una anticipacion minima exacta de 24 horas
- GIVEN un pedido pendiente WHEN se actualiza su cabecera THEN el sistema permite modificar solo los datos habilitados y respeta la validacion de fecha si esta cambia

## HU-08. Gestion de detalle del pedido y control de stock

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Pedidos
- PUNTOS DE HISTORIA: 8
- TIEMPO ESTIMADO: 32 horas
- DEPENDE DE: HU-06, HU-07

COMO administrador o ayudante
QUIERO gestionar los detalles de un pedido
PARA construir el importe real de la venta y controlar existencias

CRITERIOS DE ACEPTACION
- GIVEN un pedido pendiente WHEN se agrega un detalle THEN el sistema usa el precio real del producto, calcula subtotal y descuenta stock
- GIVEN un producto ya registrado en el pedido WHEN se intenta volver a agregar THEN el sistema no lo permite y obliga a editar el detalle existente
- GIVEN un detalle existente WHEN se actualiza o elimina THEN el sistema recalcula el stock, subtotal y total del pedido de forma consistente

## HU-09. Cambio de estado operativo del pedido

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Pedidos
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: HU-07, HU-08

COMO administrador o ayudante
QUIERO cambiar el estado de un pedido segun el momento operativo
PARA mantener la venta con un flujo controlado

CRITERIOS DE ACEPTACION
- GIVEN un pedido pendiente antes de su fecha programada WHEN el usuario decide anularlo THEN el sistema permite cambiarlo a `CANCELADO` y repone el stock de todos sus detalles
- GIVEN un pedido pendiente despues de su fecha programada WHEN el usuario decide cerrarlo THEN el sistema permite cambiarlo a `COMPLETADO`
- GIVEN un pedido cancelado o completado WHEN el usuario intenta gestionar detalles THEN el sistema bloquea esa operacion

## HU-10. Recibo PDF del pedido

- EPICA: WEBADMIN DE PEDIDOS
- MODULO: Pedidos
- PUNTOS DE HISTORIA: 5
- TIEMPO ESTIMADO: 20 horas
- DEPENDE DE: HU-07, HU-08

COMO administrador o ayudante
QUIERO descargar un recibo PDF del pedido
PARA contar con una salida documental de la venta registrada

CRITERIOS DE ACEPTACION
- GIVEN un pedido valido con detalles WHEN el usuario solicita el recibo THEN el sistema genera y descarga el PDF con la informacion actual del pedido
- GIVEN un pedido incompleto WHEN el usuario intenta generar el recibo THEN el sistema informa claramente que datos faltan
- GIVEN un pedido con detalles registrados WHEN se descarga el PDF THEN el documento muestra cliente, empleado, fecha, estado, lineas de detalle y resumen monetario
