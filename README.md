# Sistema de Gestión para Taller Hidráulico

Un sistema completo de gestión para talleres de reparaciones hidráulicas, grúas y plataformas. Incluye gestión de clientes, vehículos, citas, partes de trabajo, inventario y control de usuarios con diferentes roles.

## 🚀 Características

### 📋 Gestión de Partes de Trabajo
- Creación y seguimiento de partes de trabajo
- Asignación de técnicos
- Estados de trabajo (en proceso, completado, cancelado)
- Prioridades (baja, normal, alta, urgente)
- Registro de horas de trabajo
- Control de materiales utilizados

### 👥 Gestión de Clientes
- Registro completo de clientes
- Información de contacto y empresa
- Historial de vehículos por cliente
- Seguimiento de partes de trabajo

### 🚗 Gestión de Vehículos
- Registro de vehículos por cliente
- Tipos: grúas, plataformas, camiones, etc.
- Información de marca, modelo, matrícula
- Historial de reparaciones

### 📅 Sistema de Citas
- Programación de citas
- Asignación de técnicos
- Estados: programada, confirmada, completada, cancelada
- Diferentes tipos de servicio

### 📦 Control de Inventario
- Gestión de productos y stock
- Categorías de productos
- Control de precios (compra y venta)
- Alertas de stock mínimo
- Movimientos de entrada y salida
- Registro de materiales utilizados en partes de trabajo

### 👤 Sistema de Usuarios y Roles
- **Administrador**: Acceso completo a todas las funciones
- **Técnico**: Gestión de partes de trabajo y citas
- **Recepción**: Gestión de clientes, citas y vehículos

### 📊 Dashboard
- Estadísticas en tiempo real
- Resumen de actividades
- Acciones rápidas
- Alertas de stock bajo

## 🛠️ Instalación

### Requisitos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
```bash
cd taller_gestion
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Ejecutar la aplicación**
```bash
python app.py
```

4. **Acceder al sistema**
- Abrir navegador en: `http://localhost:5000`
- **Credenciales por defecto:**
  - Email: `admin@taller.com`
  - Contraseña: `admin123`

## 📁 Estructura del Proyecto

```
taller_gestion/
├── app.py                 # Aplicación principal Flask
├── models.py              # Modelos de base de datos
├── routes.py              # Rutas y controladores
├── requirements.txt       # Dependencias Python
├── templates/            # Plantillas HTML
│   ├── base.html         # Plantilla base
│   ├── login.html        # Página de login
│   ├── dashboard.html    # Dashboard principal
│   ├── clientes/         # Gestión de clientes
│   ├── vehiculos/        # Gestión de vehículos
│   ├── citas/           # Gestión de citas
│   ├── partes/          # Gestión de partes de trabajo
│   ├── inventario/      # Control de inventario
│   └── usuarios/        # Gestión de usuarios
└── README.md            # Este archivo
```

## 🗄️ Base de Datos

El sistema utiliza SQLite como base de datos por defecto. Los archivos de base de datos se crean automáticamente en:
- `taller.db` - Base de datos principal

### Modelos Principales

- **Usuario**: Gestión de usuarios y roles
- **Cliente**: Información de clientes
- **Vehículo**: Registro de vehículos por cliente
- **Cita**: Programación de citas
- **ParteTrabajo**: Partes de trabajo y reparaciones
- **Producto**: Inventario de productos
- **Categoria**: Categorías de productos
- **MovimientoStock**: Control de movimientos de inventario
- **MaterialUsado**: Materiales utilizados en partes de trabajo

## 🔧 Configuración

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
SECRET_KEY=tu-clave-secreta-aqui
FLASK_ENV=development
```

### Personalización
- Modificar `app.py` para cambiar la configuración de la base de datos
- Editar `models.py` para agregar nuevos campos
- Personalizar plantillas en `templates/`

## 📱 Uso del Sistema

### 1. Primer Acceso
1. Ejecutar la aplicación
2. Acceder con las credenciales por defecto
3. Cambiar la contraseña del administrador

### 2. Configuración Inicial
1. **Crear usuarios** con diferentes roles
2. **Agregar categorías** de productos al inventario
3. **Registrar clientes** y sus vehículos

### 3. Flujo de Trabajo Típico
1. **Recepción** registra cliente y vehículo
2. **Programa cita** para diagnóstico
3. **Técnico** crea parte de trabajo
4. **Registra materiales** utilizados
5. **Completa el trabajo** con descripción
6. **Actualiza inventario** automáticamente

## 🔒 Seguridad

- Autenticación de usuarios
- Control de acceso por roles
- Contraseñas hasheadas
- Sesiones seguras

## 🚀 Despliegue en Producción

### Usando Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Usando Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 🐛 Solución de Problemas

### Error de Base de Datos
```bash
# Eliminar base de datos corrupta
rm taller.db
# Reiniciar aplicación (se creará automáticamente)
python app.py
```

### Error de Dependencias
```bash
# Actualizar pip
pip install --upgrade pip
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

## 📞 Soporte

Para reportar problemas o solicitar nuevas características:
1. Revisar la documentación
2. Verificar logs de la aplicación
3. Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

---

**Desarrollado para talleres hidráulicos profesionales** 🛠️⚙️