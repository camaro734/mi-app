from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user, login_user, logout_user
from app import app, db
from models import *
from datetime import datetime, timedelta
import random
import string

# Función para generar número de parte
def generar_numero_parte():
    fecha = datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.digits, k=4))
    return f"PT{fecha}{random_str}"

# Rutas de autenticación
@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = Usuario.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.activo:
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Credenciales inválidas o usuario inactivo', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Estadísticas del dashboard
    total_clientes = Cliente.query.count()
    partes_en_proceso = ParteTrabajo.query.filter_by(estado='en_proceso').count()
    citas_hoy = Cita.query.filter(
        Cita.fecha_hora >= datetime.now().date()
    ).count()
    productos_bajo_stock = Producto.query.filter(
        Producto.stock_actual <= Producto.stock_minimo
    ).count()
    
    # Partes de trabajo recientes
    partes_recientes = ParteTrabajo.query.order_by(
        ParteTrabajo.fecha_inicio.desc()
    ).limit(5).all()
    
    # Citas próximas
    citas_proximas = Cita.query.filter(
        Cita.fecha_hora >= datetime.now()
    ).order_by(Cita.fecha_hora).limit(5).all()
    
    return render_template('dashboard.html',
                         total_clientes=total_clientes,
                         partes_en_proceso=partes_en_proceso,
                         citas_hoy=citas_hoy,
                         productos_bajo_stock=productos_bajo_stock,
                         partes_recientes=partes_recientes,
                         citas_proximas=citas_proximas)

# Gestión de clientes
@app.route('/clientes')
@login_required
def clientes():
    clientes = Cliente.query.order_by(Cliente.nombre).all()
    return render_template('clientes/lista.html', clientes=clientes)

@app.route('/clientes/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_cliente():
    if request.method == 'POST':
        cliente = Cliente(
            nombre=request.form['nombre'],
            email=request.form['email'],
            telefono=request.form['telefono'],
            direccion=request.form['direccion'],
            empresa=request.form['empresa']
        )
        db.session.add(cliente)
        db.session.commit()
        flash('Cliente creado exitosamente', 'success')
        return redirect(url_for('clientes'))
    
    return render_template('clientes/nuevo.html')

@app.route('/clientes/<int:id>')
@login_required
def ver_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    return render_template('clientes/ver.html', cliente=cliente)

@app.route('/clientes/<int:id>/editar', methods=['GET', 'POST'])
@login_required
def editar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    if request.method == 'POST':
        cliente.nombre = request.form['nombre']
        cliente.email = request.form['email']
        cliente.telefono = request.form['telefono']
        cliente.direccion = request.form['direccion']
        cliente.empresa = request.form['empresa']
        db.session.commit()
        flash('Cliente actualizado exitosamente', 'success')
        return redirect(url_for('clientes'))
    
    return render_template('clientes/editar.html', cliente=cliente)

# Gestión de vehículos
@app.route('/vehiculos')
@login_required
def vehiculos():
    vehiculos = Vehiculo.query.join(Cliente).order_by(Vehiculo.marca).all()
    return render_template('vehiculos/lista.html', vehiculos=vehiculos)

@app.route('/vehiculos/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_vehiculo():
    if request.method == 'POST':
        vehiculo = Vehiculo(
            marca=request.form['marca'],
            modelo=request.form['modelo'],
            tipo=request.form['tipo'],
            matricula=request.form['matricula'],
            año=int(request.form['año']) if request.form['año'] else None,
            cliente_id=int(request.form['cliente_id'])
        )
        db.session.add(vehiculo)
        db.session.commit()
        flash('Vehículo registrado exitosamente', 'success')
        return redirect(url_for('vehiculos'))
    
    clientes = Cliente.query.order_by(Cliente.nombre).all()
    return render_template('vehiculos/nuevo.html', clientes=clientes)

# Gestión de citas
@app.route('/citas')
@login_required
def citas():
    citas = Cita.query.join(Cliente).order_by(Cita.fecha_hora).all()
    return render_template('citas/lista.html', citas=citas)

@app.route('/citas/nueva', methods=['GET', 'POST'])
@login_required
def nueva_cita():
    if request.method == 'POST':
        cita = Cita(
            fecha_hora=datetime.strptime(request.form['fecha_hora'], '%Y-%m-%dT%H:%M'),
            descripcion=request.form['descripcion'],
            tipo_servicio=request.form['tipo_servicio'],
            cliente_id=int(request.form['cliente_id']),
            vehiculo_id=int(request.form['vehiculo_id']) if request.form['vehiculo_id'] else None,
            tecnico_id=int(request.form['tecnico_id']) if request.form['tecnico_id'] else None
        )
        db.session.add(cita)
        db.session.commit()
        flash('Cita programada exitosamente', 'success')
        return redirect(url_for('citas'))
    
    clientes = Cliente.query.order_by(Cliente.nombre).all()
    tecnicos = Usuario.query.filter_by(rol='tecnico').all()
    return render_template('citas/nueva.html', clientes=clientes, tecnicos=tecnicos)

@app.route('/citas/<int:id>/estado', methods=['POST'])
@login_required
def cambiar_estado_cita(id):
    cita = Cita.query.get_or_404(id)
    cita.estado = request.form['estado']
    db.session.commit()
    flash('Estado de cita actualizado', 'success')
    return redirect(url_for('citas'))

# Gestión de partes de trabajo
@app.route('/partes')
@login_required
def partes():
    partes = ParteTrabajo.query.join(Cliente).join(Vehiculo).order_by(
        ParteTrabajo.fecha_inicio.desc()
    ).all()
    return render_template('partes/lista.html', partes=partes)

@app.route('/partes/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_parte():
    if request.method == 'POST':
        parte = ParteTrabajo(
            numero_parte=generar_numero_parte(),
            descripcion_problema=request.form['descripcion_problema'],
            prioridad=request.form['prioridad'],
            cliente_id=int(request.form['cliente_id']),
            vehiculo_id=int(request.form['vehiculo_id']),
            tecnico_id=int(request.form['tecnico_id']) if request.form['tecnico_id'] else None
        )
        db.session.add(parte)
        db.session.commit()
        flash('Parte de trabajo creado exitosamente', 'success')
        return redirect(url_for('partes'))
    
    clientes = Cliente.query.order_by(Cliente.nombre).all()
    tecnicos = Usuario.query.filter_by(rol='tecnico').all()
    return render_template('partes/nuevo.html', clientes=clientes, tecnicos=tecnicos)

@app.route('/partes/<int:id>')
@login_required
def ver_parte(id):
    parte = ParteTrabajo.query.get_or_404(id)
    return render_template('partes/ver.html', parte=parte)

@app.route('/partes/<int:id>/completar', methods=['POST'])
@login_required
def completar_parte(id):
    parte = ParteTrabajo.query.get_or_404(id)
    parte.estado = 'completado'
    parte.fecha_fin = datetime.now()
    parte.trabajo_realizado = request.form['trabajo_realizado']
    parte.horas_trabajo = float(request.form['horas_trabajo'])
    db.session.commit()
    flash('Parte de trabajo completado', 'success')
    return redirect(url_for('partes'))

# Gestión de inventario
@app.route('/inventario')
@login_required
def inventario():
    productos = Producto.query.join(Categoria).order_by(Producto.nombre).all()
    return render_template('inventario/lista.html', productos=productos)

@app.route('/inventario/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_producto():
    if request.method == 'POST':
        producto = Producto(
            codigo=request.form['codigo'],
            nombre=request.form['nombre'],
            descripcion=request.form['descripcion'],
            precio_compra=float(request.form['precio_compra']),
            precio_venta=float(request.form['precio_venta']),
            stock_actual=int(request.form['stock_actual']),
            stock_minimo=int(request.form['stock_minimo']),
            categoria_id=int(request.form['categoria_id']) if request.form['categoria_id'] else None,
            proveedor=request.form['proveedor']
        )
        db.session.add(producto)
        db.session.commit()
        flash('Producto agregado exitosamente', 'success')
        return redirect(url_for('inventario'))
    
    categorias = Categoria.query.order_by(Categoria.nombre).all()
    return render_template('inventario/nuevo.html', categorias=categorias)

@app.route('/inventario/<int:id>/movimiento', methods=['POST'])
@login_required
def movimiento_stock(id):
    producto = Producto.query.get_or_404(id)
    tipo = request.form['tipo']
    cantidad = int(request.form['cantidad'])
    motivo = request.form['motivo']
    
    if tipo == 'entrada':
        producto.stock_actual += cantidad
    elif tipo == 'salida':
        if producto.stock_actual >= cantidad:
            producto.stock_actual -= cantidad
        else:
            flash('Stock insuficiente', 'error')
            return redirect(url_for('inventario'))
    
    movimiento = MovimientoStock(
        tipo=tipo,
        cantidad=cantidad,
        motivo=motivo,
        producto_id=id,
        usuario_id=current_user.id
    )
    db.session.add(movimiento)
    db.session.commit()
    flash('Movimiento de stock registrado', 'success')
    return redirect(url_for('inventario'))

# Gestión de usuarios (solo admin)
@app.route('/usuarios')
@login_required
def usuarios():
    if current_user.rol != 'admin':
        flash('Acceso denegado', 'error')
        return redirect(url_for('dashboard'))
    
    usuarios = Usuario.query.order_by(Usuario.nombre).all()
    return render_template('usuarios/lista.html', usuarios=usuarios)

@app.route('/usuarios/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_usuario():
    if current_user.rol != 'admin':
        flash('Acceso denegado', 'error')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        usuario = Usuario(
            nombre=request.form['nombre'],
            email=request.form['email'],
            rol=request.form['rol']
        )
        usuario.set_password(request.form['password'])
        db.session.add(usuario)
        db.session.commit()
        flash('Usuario creado exitosamente', 'success')
        return redirect(url_for('usuarios'))
    
    return render_template('usuarios/nuevo.html')

# API para obtener vehículos de un cliente
@app.route('/api/vehiculos/<int:cliente_id>')
@login_required
def api_vehiculos_cliente(cliente_id):
    vehiculos = Vehiculo.query.filter_by(cliente_id=cliente_id).all()
    return jsonify([{
        'id': v.id,
        'marca': v.marca,
        'modelo': v.modelo,
        'tipo': v.tipo,
        'matricula': v.matricula
    } for v in vehiculos])