create extension if not exists pgcrypto;

create table if not exists rol (
    id_rol uuid primary key default gen_random_uuid(),
    nombre_rol varchar(50) not null unique,
    descripcion_rol varchar(200),
    es_activo_rol boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists empleado (
    id_empleado uuid primary key default gen_random_uuid(),
    ci_empleado varchar(20) not null unique,
    nombres_completo_empleado varchar(120) not null,
    apellidos_completo_empleado varchar(120) not null,
    correo_electronico_empleado varchar(120) not null unique,
    fecha_nacimiento_empleado date,
    telefono_empleado varchar(20),
    es_activo_empleado boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists usuario (
    id_usuario uuid primary key default gen_random_uuid(),
    id_empleado uuid not null references empleado(id_empleado),
    id_rol uuid not null references rol(id_rol),
    nombre_usuario varchar(60) not null unique,
    contrasenia_usuario varchar(255),
    ultima_sesion_usuario timestamptz,
    es_activo_usuario boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists cliente (
    id_cliente uuid primary key default gen_random_uuid(),
    ci_cliente varchar(20) not null unique,
    nombres_completo_cliente varchar(120) not null,
    apellidos_completo_cliente varchar(120) not null,
    telefono_cliente varchar(20),
    correo_electronico_cliente varchar(120),
    direccion_cliente varchar(200),
    es_activo_cliente boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists producto (
    id_producto uuid primary key default gen_random_uuid(),
    codigo_producto varchar(30) not null unique,
    nombre_producto varchar(120) not null unique,
    descripcion_producto varchar(300),
    precio_producto decimal(12,2) not null,
    stock_producto integer not null default 0,

    nombre_bucket_imagen_producto varchar(100),
    ruta_imagen_producto varchar(500),
    url_imagen_producto varchar(500),
    tipo_mime_imagen_producto varchar(100),
    tamano_bytes_imagen_producto bigint,

    es_activo_producto boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists ordenpedido (
    id_orden_pedido uuid primary key default gen_random_uuid(),
    id_cliente uuid not null references cliente(id_cliente),
    id_empleado uuid not null references empleado(id_empleado),

    codigo_orden_pedido varchar(30) not null unique,
    fecha_orden_pedido timestamptz not null default now(),
    estado_orden_pedido varchar(30) not null default 'pendiente',
    observacion_orden_pedido varchar(300),

    subtotal_orden_pedido decimal(12,2) not null default 0,
    descuento_orden_pedido decimal(12,2) not null default 0,
    total_orden_pedido decimal(12,2) not null default 0,

    es_activo_orden_pedido boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table if not exists detalleorden (
    id_detalle_orden uuid primary key default gen_random_uuid(),
    id_orden_pedido uuid not null references ordenpedido(id_orden_pedido) on delete cascade,
    id_producto uuid not null references producto(id_producto),

    cantidad_detalle_orden integer not null,
    precio_unitario_detalle_orden decimal(12,2) not null,
    subtotal_detalle_orden decimal(12,2) not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (id_orden_pedido, id_producto)
); 

create index if not exists idx_usuario_id_empleado
on usuario(id_empleado);

create index if not exists idx_usuario_id_rol
on usuario(id_rol);

create index if not exists idx_usuario_nombre_usuario
on usuario(nombre_usuario);

create index if not exists idx_empleado_ci_empleado
on empleado(ci_empleado);

create index if not exists idx_empleado_correo_electronico_empleado
on empleado(correo_electronico_empleado);

create index if not exists idx_cliente_ci_cliente
on cliente(ci_cliente);

create index if not exists idx_cliente_correo_electronico_cliente
on cliente(correo_electronico_cliente);

create index if not exists idx_producto_codigo_producto
on producto(codigo_producto);

create index if not exists idx_producto_nombre_producto
on producto(nombre_producto);

create index if not exists idx_ordenpedido_id_cliente
on ordenpedido(id_cliente);

create index if not exists idx_ordenpedido_id_empleado
on ordenpedido(id_empleado);

create index if not exists idx_ordenpedido_codigo_orden_pedido
on ordenpedido(codigo_orden_pedido);

create index if not exists idx_ordenpedido_fecha_orden_pedido
on ordenpedido(fecha_orden_pedido);

create index if not exists idx_ordenpedido_estado_orden_pedido
on ordenpedido(estado_orden_pedido);

create index if not exists idx_detalleorden_id_orden_pedido
on detalleorden(id_orden_pedido);

create index if not exists idx_detalleorden_id_producto
on detalleorden(id_producto);