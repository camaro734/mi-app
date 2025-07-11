# 🚀 Guía de Uso - Sistema de Gestión de Tareas

## 📋 Acceso al Sistema

Para acceder al nuevo módulo de **Tareas y Proyectos**:

1. **Inicie sesión** en el sistema CMG HIDRÁULICA S.L.
2. En el **menú lateral**, haga clic en **"Tareas y Proyectos"** (icono de checklist)
3. Será redirigido a `/tareas` donde podrá ver el dashboard completo

## 🎯 Funciones Principales

### 1. **Crear Nueva Tarea**
```
1. Haga clic en el botón "Nueva Tarea" (esquina superior derecha)
2. Complete el formulario:
   - Título* (obligatorio)
   - Descripción* (obligatorio)
   - Estado (Pendiente por defecto)
   - Prioridad (Media por defecto)
   - Responsable* (obligatorio)
   - Proyecto* (obligatorio)
   - Fecha límite* (obligatorio)
   - Etiquetas (opcional, separadas por comas)
3. Haga clic en "Crear Tarea"
```

### 2. **Buscar y Filtrar Tareas**
```
- Use la barra de búsqueda para encontrar tareas por:
  * Título
  * Descripción
  * Responsable
  * Proyecto
  
- Use los filtros desplegables para:
  * Estado: Todos, Pendiente, En progreso, Pausado, Completado
  * Prioridad: Todas, Baja, Media, Alta
```

### 3. **Ver Detalles de una Tarea**
```
1. Haga clic en cualquier tarjeta de tarea
2. Se abrirá un modal con información completa:
   - Detalles completos
   - Información temporal
   - Progreso actual
   - Etiquetas
   - Estado de vencimiento
```

### 4. **Editar una Tarea**
```
Opción 1: Desde la lista
1. Haga clic en el menú de 3 puntos (⋮) en la tarjeta
2. Seleccione "Editar"

Opción 2: Desde detalles
1. Abra los detalles de la tarea
2. Haga clic en "Editar Tarea"

En el modal de edición podrá:
- Modificar todos los campos
- Actualizar el progreso (0-100%)
- El estado se ajusta automáticamente según el progreso
```

### 5. **Eliminar una Tarea**
```
1. Haga clic en el menú de 3 puntos (⋮) en la tarjeta
2. Seleccione "Eliminar"
3. Confirme la acción

⚠️ Solo administradores y supervisores pueden eliminar tareas
```

## 📊 Dashboard y Métricas

El dashboard muestra 5 métricas clave:

- **Total**: Número total de tareas en el sistema
- **En Progreso**: Tareas actualmente siendo trabajadas
- **Pendientes**: Tareas que aún no han comenzado
- **Completadas**: Tareas finalizadas
- **Vencidas**: Tareas que superaron su fecha límite

## 🎨 Código de Colores

### Estados:
- 🔵 **En progreso**: Azul
- 🟡 **Pendiente**: Amarillo
- 🟢 **Completado**: Verde
- ⚫ **Pausado**: Gris

### Prioridades:
- 🔴 **Alta**: Rojo
- 🟡 **Media**: Amarillo
- 🟢 **Baja**: Verde

### Indicadores Especiales:
- 🔴 **Vencida**: Fondo rojo para tareas pasadas de fecha
- 📅 **Próximo vencimiento**: Contador de días restantes

## 🔐 Permisos por Rol

### **Administrador**
- ✅ Ver todas las tareas
- ✅ Crear nuevas tareas
- ✅ Editar cualquier tarea
- ✅ Eliminar tareas
- ✅ Acceso completo a todas las funciones

### **Supervisor**
- ✅ Ver todas las tareas
- ✅ Crear nuevas tareas
- ✅ Editar cualquier tarea
- ✅ Eliminar tareas
- ✅ Acceso completo a todas las funciones

### **Técnico**
- ✅ Ver todas las tareas
- ❌ No puede crear tareas
- ❌ No puede editar tareas
- ❌ No puede eliminar tareas

## 💡 Consejos de Uso

### **Organización Eficiente**
1. **Use etiquetas** para categorizar tareas (ej: "mantenimiento", "urgente", "cliente")
2. **Asigne proyectos** descriptivos para agrupar tareas relacionadas
3. **Establezca fechas límite** realistas
4. **Actualice el progreso** regularmente

### **Mejores Prácticas**
1. **Títulos descriptivos**: Use títulos claros y específicos
2. **Descripciones detalladas**: Incluya toda la información necesaria
3. **Prioridades apropiadas**: Reserve "Alta" para tareas realmente urgentes
4. **Seguimiento regular**: Revise y actualice las tareas frecuentemente

### **Estados de Progreso**
- **0%**: Automáticamente marca como "Pendiente"
- **1-99%**: Ideal para "En progreso"
- **100%**: Automáticamente marca como "Completado"
- Use "Pausado" para tareas temporalmente suspendidas

## 🔧 Solución de Problemas

### **No puedo crear tareas**
- Verifique que tiene permisos (Admin/Supervisor)
- Asegúrese de completar todos los campos obligatorios (*)

### **No veo el botón "Nueva Tarea"**
- Confirme su rol de usuario
- Solo Admin y Supervisor pueden crear tareas

### **Las fechas no se calculan correctamente**
- Verifique que la fecha límite esté en formato correcto
- Las fechas pasadas aparecerán marcadas como "Vencida"

### **Los filtros no funcionan**
- Limpie la búsqueda y vuelva a intentar
- Verifique que hay tareas que coincidan con los filtros

## 📱 Acceso Móvil

El sistema es completamente responsivo:
- ✅ **Smartphones**: Diseño optimizado para pantallas pequeñas
- ✅ **Tablets**: Aprovecha el espacio disponible
- ✅ **Desktop**: Experiencia completa con todas las funciones

## 🆘 Soporte

Para soporte técnico o preguntas sobre el sistema:
1. Consulte esta documentación
2. Contacte al administrador del sistema
3. Revise el archivo `SISTEMA_GESTION_TAREAS.md` para detalles técnicos

---

## 🎉 ¡Comience a Usar el Sistema!

1. **Acceda** a "Tareas y Proyectos" en el menú
2. **Explore** las tareas de ejemplo incluidas
3. **Cree** su primera tarea personalizada
4. **Experimente** con los filtros y búsqueda

El sistema está diseñado para ser **intuitivo** y **fácil de usar**. ¡Empiece a organizar sus proyectos de manera más eficiente!