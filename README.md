# Programa de Gestión Sencillo

Este repositorio contiene un pequeño programa de gestión (CRUD) que utiliza SQLite como base de datos y se maneja desde la línea de comandos.

## Requisitos

* Python ≥ 3.7 (no se necesitan paquetes externos)

## Instalación

No se requiere instalación especial. Simplemente clone o copie el archivo `gestion.py` en su equipo.

```bash
# Ejemplo
python gestion.py --help
```

## Uso Rápido

Inicializar la base de datos:

```bash
python gestion.py init
```

Añadir un registro:

```bash
python gestion.py add "Mi producto" "Descripción de ejemplo"
```

Listar registros:

```bash
python gestion.py list
```

Actualizar un registro (ID 1):

```bash
python gestion.py update 1 "Nombre actualizado" "Descripción nueva"
```

Eliminar un registro (ID 1):

```bash
python gestion.py delete 1
```

## Estructura de la Base de Datos

* **id** INTEGER PRIMARY KEY AUTOINCREMENT
* **nombre** TEXT (obligatorio)
* **descripcion** TEXT (opcional)

La base de datos se guarda como `gestion.db` en el mismo directorio donde se encuentra `gestion.py`.

## Licencia

MIT