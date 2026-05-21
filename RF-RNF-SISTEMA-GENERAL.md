# RF-RNF SISTEMA GENERAL

## Alcance del documento

Este documento define los requerimientos funcionales y no funcionales vigentes del sistema de gestion de pedidos desarrollado en `practica31testing`.

El alcance contempla:

- FRONTEND WEB ADMINISTRATIVO
- BACKEND CENTRAL
- BASE DE DATOS SUPABASE
- STORAGE DE IMAGENES DE PRODUCTOS

El documento expresa que debe hacer el sistema y como debe comportarse a nivel general.
No describe decisiones internas de implementacion en detalle tecnico profundo.

## Requerimientos funcionales

### 1. Requerimientos generales del sistema

RF-01. El sistema debe permitir autenticar a usuarios internos autorizados mediante nombre de usuario y contrasenia.

RF-02. El sistema debe permitir cerrar la sesion activa del usuario autenticado.

RF-03. El sistema debe mostrar la identidad basica del usuario autenticado, su rol y la informacion operativa asociada.

RF-04. El sistema debe restringir menus, rutas, vistas y acciones segun el rol del usuario autenticado.

RF-05. El sistema debe mostrar una vista de acceso no autorizado cuando una persona intente ingresar a una ruta sin permiso.

RF-06. El sistema debe conservar trazabilidad basica mediante fechas de creacion, actualizacion, archivado, anulacion, cierre o ultima sesion cuando corresponda.

RF-07. El sistema debe permitir archivar y reactivar registros sin perder historial cuando la entidad tenga control de actividad.

RF-08. El sistema debe permitir eliminar fisicamente registros solo cuando no rompan relaciones existentes.

RF-09. El sistema debe mostrar mensajes claros de validacion y de negocio sin exponer errores tecnicos crudos al usuario final.

RF-10. El sistema debe manejar busqueda, filtros, paginacion y vistas de detalle completo en los modulos administrativos donde aplique.

### 2. Seguridad y roles

RF-11. El sistema debe permitir iniciar sesion solo a usuarios activos, vinculados a empleados activos y a roles activos.

RF-12. El sistema debe permitir acceso total al rol `ADMINISTRADOR`.

RF-13. El sistema debe permitir al rol `AYUDANTE` acceder solamente a los apartados de `Clientes`, `Productos` y `Pedidos`.

RF-14. El sistema debe impedir que el rol `AYUDANTE` acceda a `Dashboard`, `Roles`, `Empleados` y `Usuarios`.

RF-15. El sistema debe proteger las rutas del frontend y los endpoints del backend de acuerdo con el rol autenticado.

RF-16. El sistema debe mantener la sesion autenticada mediante JWT almacenado en cookies HttpOnly.

### 3. Roles

RF-17. El sistema debe permitir al administrador registrar roles validos con nombre y descripcion.

RF-18. El sistema debe permitir consultar, actualizar, archivar, reactivar y eliminar roles cuando no tengan usuarios relacionados.

RF-19. El sistema debe impedir el registro de nombres de rol duplicados.

### 4. Empleados

RF-20. El sistema debe permitir registrar empleados con CI, nombres, apellidos, correo, fecha de nacimiento y telefono.

RF-21. El sistema debe permitir consultar, actualizar, archivar, reactivar y eliminar empleados cuando no tengan usuarios ni pedidos relacionados.

RF-22. El sistema debe impedir duplicados por CI y por correo electronico de empleado.

RF-23. El sistema debe mostrar opciones activas de empleados para procesos que las necesiten, como la asignacion de usuarios y pedidos.

### 5. Usuarios

RF-24. El sistema debe permitir crear usuarios internos asociados a un empleado activo y a un rol activo.

RF-25. El sistema debe generar automaticamente el nombre de usuario a partir de nombres, apellidos y CI del empleado segun la regla de negocio definida.

RF-26. El sistema debe generar una contrasenia inicial y almacenarla cifrada.

RF-27. El sistema debe permitir actualizar datos de usuario, incluyendo empleado, rol y contrasenia.

RF-28. El sistema debe permitir archivar, reactivar y eliminar usuarios segun sus relaciones vigentes.

RF-29. El sistema debe actualizar la fecha de ultima sesion del usuario al autenticarse correctamente.

### 6. Clientes

RF-30. El sistema debe permitir registrar clientes con CI, nombres, apellidos, telefono, correo y direccion.

RF-31. El sistema debe permitir consultar, actualizar, archivar, reactivar y eliminar clientes cuando no tengan pedidos relacionados.

RF-32. El sistema debe impedir duplicados por CI de cliente.

### 7. Productos

RF-33. El sistema debe permitir registrar productos con codigo, nombre, descripcion, precio, stock e imagen opcional.

RF-34. El sistema debe permitir consultar, actualizar, archivar, reactivar y eliminar productos cuando no existan detalles de pedido vinculados.

RF-35. El sistema debe impedir duplicados por codigo y por nombre de producto.

RF-36. El sistema debe permitir cargar, reemplazar o eliminar la imagen unica de un producto mediante el backend.

RF-37. El sistema debe permitir listar los productos en formato de cards mostrando imagen e informacion comercial relevante.

### 8. Pedidos

RF-38. El sistema debe permitir registrar pedidos asociados a un cliente y a un empleado activos.

RF-39. El sistema debe generar automaticamente el codigo del pedido con el formato `PEDIDO-N`.

RF-40. El sistema debe crear todo pedido con estado inicial `PENDIENTE`.

RF-41. El sistema debe asignar automaticamente como empleado del pedido al usuario autenticado que registra o actualiza la cabecera.

RF-42. El sistema debe permitir programar la fecha del pedido con una anticipacion minima exacta de 24 horas respecto al momento actual.

RF-43. El sistema debe permitir editar la cabecera del pedido mientras el pedido siga pendiente y activo.

RF-44. El sistema debe aplicar la misma regla operativa de validacion de fecha al crear y al cambiar la fecha de un pedido existente.

RF-45. El sistema debe permitir cambiar el estado del pedido a `CANCELADO` solo antes de la fecha y hora programadas.

RF-46. El sistema debe permitir cambiar el estado del pedido a `COMPLETADO` solo despues de la fecha y hora programadas.

RF-47. El sistema debe impedir la gestion de detalles cuando el pedido ya no este pendiente o este archivado.

RF-48. El sistema debe permitir archivar, reactivar y eliminar pedidos, bloqueando la eliminacion fisica si todavia existen detalles relacionados.

### 9. Detalle de pedido

RF-49. El sistema debe permitir registrar detalles de pedido asociados a un producto valido.

RF-50. El sistema debe impedir repetir el mismo producto dentro de un mismo pedido.

RF-51. El sistema debe recalcular en backend el precio unitario, subtotal del detalle, subtotal del pedido y total del pedido usando el precio real del producto.

RF-52. El sistema debe validar stock suficiente antes de crear o actualizar un detalle.

RF-53. El sistema debe descontar stock del producto cuando se crea un detalle.

RF-54. El sistema debe reajustar stock correctamente cuando se actualiza la cantidad o el producto de un detalle.

RF-55. El sistema debe reponer stock cuando se elimina un detalle.

RF-56. El sistema debe reponer el stock de todos los detalles cuando un pedido pendiente se cancela.

RF-57. El sistema debe mostrar solamente productos activos disponibles y aun no registrados en el pedido al momento de crear un nuevo detalle.

### 10. Recibo y reporte del pedido

RF-58. El sistema debe permitir descargar un recibo PDF del pedido a partir de la informacion actual registrada.

RF-59. El sistema debe obtener el recibo a partir de la cabecera vigente del pedido y de la totalidad de sus detalles registrados.

RF-60. El sistema debe impedir la generacion del recibo cuando falten datos esenciales del pedido o cuando no existan detalles registrados.

RF-61. El sistema debe informar de forma clara, mediante mensaje emergente, que informacion falta cuando no sea posible generar el recibo.

## Requerimientos no funcionales

RNF-01. El sistema debe ser seguro, permitiendo acceso solo a usuarios autenticados y autorizados segun su rol.

RNF-02. El sistema debe ser consistente, preservando integridad entre roles, empleados, usuarios, clientes, productos, pedidos y detalles.

RNF-03. El sistema debe ser usable, con formularios claros, mensajes comprensibles y acciones sensibles confirmadas previamente.

RNF-04. El sistema debe ser responsive para computadora, tablet y telefono.

RNF-05. El sistema debe usar una presentacion administrativa coherente y uniforme en todos los apartados.

RNF-06. El sistema debe manejar fechas persistidas en UTC y mostradas operativamente en `America/La_Paz`.

RNF-07. El sistema debe ser mantenible, conservando separacion de responsabilidades y arquitectura por capas.

RNF-08. El sistema debe ser escalable, permitiendo agregar nuevos modulos sin rehacer el producto completo.

RNF-09. El sistema debe ser testeable, dejando la logica de negocio en `service`, el acceso a datos en `repository` y los controladores delgados.

RNF-10. El sistema debe evitar perdida innecesaria de datos ingresados por el usuario cuando exista una validacion fallida.

RNF-11. El sistema debe centralizar configuracion por variables de entorno para facilitar trabajo local y despliegue.

RNF-12. El sistema debe usar CSS puro y componentes reutilizables sin depender de frameworks visuales pesados.

RNF-13. El sistema debe limitar el acceso directo a la base de datos y al storage exclusivamente al backend.

RNF-14. El sistema debe proteger las contrasenias almacenandolas cifradas y sin exponerlas en respuestas del backend.

RNF-15. El sistema debe limitar el tamano de imagen de producto a 1 MB y aceptar tipos de imagen compatibles con Supabase Storage.

RNF-16. El sistema debe mantener tiempos de respuesta razonables en operaciones CRUD, listados y calculos de pedidos bajo carga normal.

RNF-17. El sistema debe ofrecer un nivel basico de accesibilidad con etiquetas claras, botones identificables y retroalimentacion visible.

RNF-18. El sistema debe permitir evolucion posterior hacia pruebas unitarias, integracion, humo, regresion, carga, estres y rendimiento.

## Nota de relacion con otros documentos

El detalle de historias de usuario se desarrolla en:

- `HISTORIAS-USUARIO-SISTEMA-GENERAL.md`

El detalle de restricciones tecnicas, arquitectura y condiciones de implementacion se desarrolla en:

- `RESTRICCIONES-TECNICAS-SISTEMA-GENERAL.md`
