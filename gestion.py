#!/usr/bin/env python3
"""
Programa de gestión sencillo (CRUD) usando SQLite y la línea de comandos.

Uso:
  python gestion.py init                       # Crea la base de datos y la tabla
  python gestion.py add "Nombre" "Descripción"  # Añade un registro
  python gestion.py list                       # Lista todos los registros
  python gestion.py update ID "Nombre" "Desc"   # Actualiza un registro
  python gestion.py delete ID                  # Elimina un registro

La base de datos se guarda en el archivo "gestion.db" en el directorio actual.
"""

import argparse
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).with_suffix('.db')
TABLE_NAME = 'items'

def get_connection():
    """Devuelve una conexión a la base de datos."""
    return sqlite3.connect(DB_PATH)

def init_db():
    """Crea la base de datos y la tabla si no existen."""
    with get_connection() as conn:
        c = conn.cursor()
        c.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT
            );
            """
        )
        conn.commit()
    print(f'Base de datos inicializada en {DB_PATH}')

def add_item(nombre: str, descripcion: str):
    with get_connection() as conn:
        c = conn.cursor()
        c.execute(
            f"INSERT INTO {TABLE_NAME} (nombre, descripcion) VALUES (?, ?)",
            (nombre, descripcion),
        )
        conn.commit()
    print('Registro añadido correctamente.')

def list_items():
    with get_connection() as conn:
        c = conn.cursor()
        c.execute(f"SELECT id, nombre, descripcion FROM {TABLE_NAME} ORDER BY id;")
        rows = c.fetchall()
    if not rows:
        print('No hay registros.')
        return
    print(f"{'ID':<5} {'Nombre':<20} Descripción")
    print('-' * 50)
    for row in rows:
        id_, nombre, descripcion = row
        print(f"{id_:<5} {nombre:<20} {descripcion}")

def update_item(item_id: int, nombre: str, descripcion: str):
    with get_connection() as conn:
        c = conn.cursor()
        c.execute(
            f"UPDATE {TABLE_NAME} SET nombre = ?, descripcion = ? WHERE id = ?", (nombre, descripcion, item_id)
        )
        if c.rowcount == 0:
            print(f'No existe un registro con ID {item_id}.')
        else:
            conn.commit()
            print('Registro actualizado.')

def delete_item(item_id: int):
    with get_connection() as conn:
        c = conn.cursor()
        c.execute(f"DELETE FROM {TABLE_NAME} WHERE id = ?", (item_id,))
        if c.rowcount == 0:
            print(f'No existe un registro con ID {item_id}.')
        else:
            conn.commit()
            print('Registro eliminado.')

def parse_args(argv):
    parser = argparse.ArgumentParser(description='Programa de gestión simple.')
    subparsers = parser.add_subparsers(dest='command', required=True)

    # init
    subparsers.add_parser('init', help='Inicializa la base de datos.')

    # add
    add_parser = subparsers.add_parser('add', help='Añade un nuevo registro.')
    add_parser.add_argument('nombre', help='Nombre del registro')
    add_parser.add_argument('descripcion', help='Descripción del registro')

    # list
    subparsers.add_parser('list', help='Lista todos los registros.')

    # update
    upd_parser = subparsers.add_parser('update', help='Actualiza un registro existente.')
    upd_parser.add_argument('id', type=int, help='ID del registro')
    upd_parser.add_argument('nombre', help='Nuevo nombre')
    upd_parser.add_argument('descripcion', help='Nueva descripción')

    # delete
    del_parser = subparsers.add_parser('delete', help='Elimina un registro.')
    del_parser.add_argument('id', type=int, help='ID del registro')

    return parser.parse_args(argv)

def main():
    args = parse_args(sys.argv[1:])

    # Nos aseguramos de que la base de datos exista antes de operaciones que la requieran
    if args.command != 'init' and not DB_PATH.exists():
        print('La base de datos no existe. Ejecute "python gestion.py init" primero.')
        sys.exit(1)

    if args.command == 'init':
        init_db()
    elif args.command == 'add':
        add_item(args.nombre, args.descripcion)
    elif args.command == 'list':
        list_items()
    elif args.command == 'update':
        update_item(args.id, args.nombre, args.descripcion)
    elif args.command == 'delete':
        delete_item(args.id)
    else:
        print('Comando no reconocido.')
        sys.exit(1)

if __name__ == '__main__':
    main()