# RESTRICCIONES TECNICAS SISTEMA GENERAL

## Alcance del documento

Este documento resume las restricciones tecnicas del sistema de gestion de pedidos desarrollado en `practica31testing`.

El alcance contempla:

- FRONTEND WEB ADMINISTRATIVO
- BACKEND CENTRAL
- SUPABASE POSTGRESQL
- SUPABASE STORAGE

Su finalidad es dejar claro con que tecnologias, arquitectura, plataformas y condiciones tecnicas opera el software actual.

## 1. Arquitectura general del sistema

1. El sistema utiliza una arquitectura cliente-servidor con un backend unico que concentra autenticacion, reglas de negocio, acceso a datos y exposicion de servicios HTTP.

2. El backend esta implementado con arquitectura modular por dominio y arquitectura en capas.

3. La regla arquitectonica obligatoria del backend es:

`Controller -> DTO -> Service -> Repository -> Supabase`

4. El frontend web es una aplicacion desacoplada del backend y consume la API mediante un cliente HTTP centralizado.

5. La base de datos y el almacenamiento estan centralizados en Supabase, por lo que el frontend no se conecta de forma directa a la base de datos ni a Storage.

## 2. Backend central

### 2.1 Stack tecnico

- NestJS
- TypeScript
- Supabase PostgreSQL
- Supabase Storage
- class-validator y class-transformer para DTOs
- bcryptjs para cifrado de contrasenias
- helmet para cabeceras de seguridad
- cookie-parser para manejo de cookies

### 2.2 Arquitectura aplicada

1. El backend esta organizado por modulos de dominio:

- `auth`
- `roles`
- `empleados`
- `usuarios`
- `clientes`
- `productos`
- `pedidos`

2. La carpeta `common` concentra configuracion, constantes, decoradores, guards, filtros, interceptores, DTOs comunes, utilidades y la integracion central con Supabase.

3. Las reglas de negocio viven en los `service`.

4. El acceso a datos se encapsula en `repository`.

5. La validacion de entrada se realiza con DTOs y `ValidationPipe` global.

6. Las respuestas HTTP se normalizan mediante interceptor global y los errores se traducen mediante filtro global.

### 2.3 Persistencia y almacenamiento

1. La base de datos operativa es Supabase PostgreSQL.

2. El almacenamiento de imagenes usa el bucket:

- `imagenes-productos`

3. Solo el backend puede subir, reemplazar o eliminar imagenes de producto.

4. Las fechas se persisten en UTC y se transforman para visualizacion operativa en `America/La_Paz`.

### 2.4 Seguridad y sesion

1. El sistema usa autenticacion basada en JWT firmado con HS256.

2. La sesion web se mantiene en cookie HttpOnly.

3. El backend usa:

- `JwtAuthGuard`
- `RolesGuard`
- decorador `@Publico()`
- decorador `@UsuarioActual()`
- decorador `@RolesPermitidos()`

4. Las contrasenias se almacenan hasheadas y nunca se exponen en texto plano.

5. La cookie de acceso depende de configuracion por entorno para dominio, `secure`, `sameSite` y nombre de cookie.

### 2.5 Servicios tecnicos obligatorios

1. El backend requiere variables de entorno para:

- Puerto
- URL del frontend
- JWT
- Supabase URL
- Supabase Secret Key
- Bucket de imagenes de productos
- Configuracion de cookies

2. El backend expone su API bajo el prefijo `/api`.

3. El backend esta preparado para evolucionar hacia pruebas unitarias, integracion y otros tipos de prueba sin reestructurar la arquitectura.

## 3. Reglas tecnicas de negocio ya implementadas

### 3.1 Roles

1. Los roles se administran con alta, consulta, actualizacion, archivado, reactivacion y eliminacion fisica condicionada por relaciones.

2. No se permite duplicar `nombre_rol`.

### 3.2 Empleados

1. Se valida duplicidad por `ci_empleado` y `correo_electronico_empleado`.

2. Los nombres y apellidos se normalizan a mayusculas.

3. El telefono se maneja con codigo pais y numero local, y se persiste como un unico valor internacional.

### 3.3 Usuarios

1. El nombre de usuario se genera automaticamente a partir del empleado.

2. La contrasenia inicial y cualquier nueva contrasenia se almacenan cifradas con `bcryptjs`.

3. Un usuario solo puede existir si referencia un empleado activo y un rol activo.

### 3.4 Clientes

1. Se valida duplicidad por `ci_cliente`.

2. El telefono sigue el mismo patron internacional usado en empleados.

### 3.5 Productos

1. Se valida duplicidad por `codigo_producto` y `nombre_producto`.

2. Se controla imagen unica por producto.

3. El tamano maximo configurado actualmente para imagen es 1 MB.

4. Los tipos aceptados son imagenes compatibles con Supabase Storage.

### 3.6 Pedidos

1. El codigo del pedido se genera automaticamente con el formato `PEDIDO-N`.

2. Todo pedido nuevo se crea con estado `PENDIENTE`.

3. La fecha del pedido debe programarse con 24 horas exactas de anticipacion minima.

4. Los estados operativos permitidos son:

- `PENDIENTE`
- `COMPLETADO`
- `CANCELADO`

5. Un pedido solo puede cancelarse antes de la fecha programada.

6. Un pedido solo puede completarse despues de la fecha programada.

7. Los detalles solo pueden gestionarse mientras el pedido siga pendiente y activo.

### 3.7 Detalle de pedido y stock

1. El backend recalcula siempre:

- precio unitario del detalle
- subtotal del detalle
- subtotal del pedido
- total del pedido

2. El backend nunca confia en el precio enviado por frontend.

3. Al crear detalle se descuenta stock.

4. Al editar detalle se reajusta stock segun la diferencia real de cantidad o cambio de producto.

5. Al eliminar detalle se repone stock.

6. Al cancelar un pedido se repone el stock de todos sus detalles.

7. Un mismo producto no puede repetirse dentro del mismo pedido.

8. Para crear un nuevo detalle el frontend solo muestra productos activos, con stock y aun no agregados al pedido actual.

### 3.8 Recibo PDF

1. El recibo PDF se genera desde el frontend usando la informacion actual del pedido y sus detalles.

2. Antes de generar el recibo se valida que existan cliente, empleado, codigo, total valido y al menos un detalle.

3. Si faltan datos, el sistema muestra un modal claro con los campos a revisar.

## 4. Frontend web administrativo

### 4.1 Stack tecnico

- Next.js 16 con App Router
- React 19
- TypeScript
- CSS puro
- Cliente API propio basado en `fetch`

### 4.2 Arquitectura aplicada

1. El flujo base del frontend es:

`page -> components -> services -> cliente API -> backend`

2. Las vistas administrativas viven en `app`.

3. La UI reutilizable vive en `components`.

4. El consumo HTTP vive en `services`.

5. La infraestructura de red vive en `lib/api`.

6. Los tipos compartidos viven en `types`.

7. El frontend no accede directamente a Supabase ni a Storage.

### 4.3 Seguridad en frontend

1. El acceso a rutas se controla con `proxy.ts`.

2. El frontend consulta `GET /auth/perfil` para validar sesion y resolver permisos por rol.

3. El `sidebar` y la navegacion visible se filtran segun rol.

4. El `login` consume el backend real y ya no es solo una pantalla visual.

### 4.4 Condiciones tecnicas de funcionamiento

1. El frontend requiere variables publicas para:

- URL del backend
- nombre visible de la aplicacion
- zona horaria

2. La sesion administrativa depende de `credentials: include`.

3. Los formularios usan modales y no deben limpiar informacion tras error.

4. Las tablas usan buscador, filtros y paginacion de 10 en 10.

5. Productos se muestran en cards y no en tabla.

### 4.5 Navegadores y plataformas objetivo

1. El sistema esta orientado a navegadores modernos con soporte para JavaScript, `fetch`, CSS Grid y Flexbox.

2. Los navegadores objetivo son:

- Google Chrome estable
- Microsoft Edge estable
- Mozilla Firefox estable
- Safari estable

3. Puede utilizarse desde Windows, macOS, Linux, Android o iOS mediante navegador compatible.

## 5. Variables de entorno y puertos locales

### 5.1 Backend

Variables requeridas o vigentes:

- `PUERTO`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET_IMAGENES_PRODUCTOS`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `COOKIE_ACCESS_TOKEN`
- `COOKIE_DOMAIN`
- `COOKIE_SECURE`
- `COOKIE_SAME_SITE`

Puerto local previsto:

- `4001`

### 5.2 Frontend

Variables requeridas o vigentes:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NOMBRE`
- `NEXT_PUBLIC_ZONA_HORARIA`

Puerto local previsto:

- `4000`

## 6. Restricciones tecnicas para pruebas futuras

1. No debe colocarse logica de negocio en `controller`.

2. No debe colocarse acceso directo a Supabase dentro de componentes frontend.

3. No debe ocultarse logica relevante en `main.ts`.

4. Los calculos de pedidos y stock deben seguir centralizados en `service`.

5. Los `repository` deben seguir siendo reemplazables o simulables para pruebas.

6. Los DTOs deben seguir siendo la primera barrera de validacion de entrada.

7. Las pruebas futuras del backend deberan poder cubrir:

- autenticacion y autorizacion
- validacion de DTOs
- reglas de negocio de CRUD
- flujo completo de pedidos y detalles
- control de stock
- generacion de respuestas y errores coherentes
