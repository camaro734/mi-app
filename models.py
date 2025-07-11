from app import db
from flask_login import UserMixin
from datetime import datetime

class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    rol = db.Column(db.String(20), default='tecnico')  # admin, tecnico, recepcion
    activo = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    telefono = db.Column(db.String(20))
    direccion = db.Column(db.Text)
    empresa = db.Column(db.String(100))
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    vehiculos = db.relationship('Vehiculo', backref='cliente', lazy=True)
    citas = db.relationship('Cita', backref='cliente', lazy=True)
    partes_trabajo = db.relationship('ParteTrabajo', backref='cliente', lazy=True)

class Vehiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(50))  # grúa, plataforma, etc.
    matricula = db.Column(db.String(20), unique=True)
    año = db.Column(db.Integer)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    partes_trabajo = db.relationship('ParteTrabajo', backref='vehiculo', lazy=True)

class Cita(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    descripcion = db.Column(db.Text)
    estado = db.Column(db.String(20), default='programada')  # programada, confirmada, cancelada, completada
    tipo_servicio = db.Column(db.String(50))  # mantenimiento, reparación, inspección
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('vehiculo.id'))
    tecnico_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    tecnico = db.relationship('Usuario', backref='citas_asignadas')

class ParteTrabajo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero_parte = db.Column(db.String(20), unique=True, nullable=False)
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime)
    descripcion_problema = db.Column(db.Text, nullable=False)
    trabajo_realizado = db.Column(db.Text)
    estado = db.Column(db.String(20), default='en_proceso')  # en_proceso, completado, cancelado
    prioridad = db.Column(db.String(20), default='normal')  # baja, normal, alta, urgente
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('vehiculo.id'), nullable=False)
    tecnico_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    horas_trabajo = db.Column(db.Float, default=0.0)
    costo_materiales = db.Column(db.Float, default=0.0)
    costo_total = db.Column(db.Float, default=0.0)
    
    # Relaciones
    tecnico = db.relationship('Usuario', backref='partes_trabajo')
    materiales_usados = db.relationship('MaterialUsado', backref='parte_trabajo', lazy=True)

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.Text)
    
    # Relaciones
    productos = db.relationship('Producto', backref='categoria', lazy=True)

class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio_compra = db.Column(db.Float, nullable=False)
    precio_venta = db.Column(db.Float, nullable=False)
    stock_actual = db.Column(db.Integer, default=0)
    stock_minimo = db.Column(db.Integer, default=0)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'))
    proveedor = db.Column(db.String(100))
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    movimientos = db.relationship('MovimientoStock', backref='producto', lazy=True)

class MovimientoStock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # entrada, salida, ajuste
    cantidad = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    motivo = db.Column(db.String(100))
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    parte_trabajo_id = db.Column(db.Integer, db.ForeignKey('parte_trabajo.id'))
    
    # Relaciones
    usuario = db.relationship('Usuario', backref='movimientos_stock')

class MaterialUsado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    parte_trabajo_id = db.Column(db.Integer, db.ForeignKey('parte_trabajo.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    
    # Relaciones
    producto = db.relationship('Producto', backref='materiales_usados')