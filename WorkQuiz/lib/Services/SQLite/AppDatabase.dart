// ─────────────────────────────────────────────────────────────────────────────
// app_database.dart
//
// Base de datos SQLite unificada. Sustituye a:
//   • game_stats_db.dart      → tabla game_stats  (vidas y racha)
//   • LocalStorageService.dart → tabla juego_seleccionado (caché de juegos)
//
// Dependencias (pubspec.yaml):
//   sqflite: ^2.3.3
//   path: ^1.9.0
// ─────────────────────────────────────────────────────────────────────────────

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';


class AppDatabase {
  static Database? _db;

  static Future<Database> get database async {
    _db ??= await _init();
    return _db!;
  }

  static Future<Database> _init() async {
    final path = join(await getDatabasesPath(), 'app.db');
    return openDatabase(
      path,
      version: 3,
      onCreate: (db, version) => _crearTablas(db),
      onUpgrade: (db, oldVersion, newVersion) async {
        await db.execute('DROP TABLE IF EXISTS juego_seleccionado');
        await db.execute('DROP TABLE IF EXISTS juego_guardado');
        await db.execute('DROP TABLE IF EXISTS sesion');
        await _crearTablas(db);
      },
    );
  }

  static Future<void> _crearTablas(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS juego_seleccionado (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        usuarioId       TEXT    NOT NULL,
        categoriaNombre TEXT    NOT NULL,
        tipoClave       TEXT    NOT NULL,
        juegoId         INTEGER NOT NULL,
        juegoCodigo     TEXT    NOT NULL,
        guardadoEl      TEXT    NOT NULL,
        UNIQUE (usuarioId, categoriaNombre, tipoClave)
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS juego_guardado (
        usuarioId   TEXT NOT NULL,
        codigo      TEXT NOT NULL,
        titulo      TEXT NOT NULL,
        tipoNombre  TEXT NOT NULL,
        tipoClave   TEXT NOT NULL,
        guardadoEl  TEXT NOT NULL,
        PRIMARY KEY (usuarioId, codigo)
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS sesion (
        id          INTEGER PRIMARY KEY CHECK (id = 1),
        usuarioId   TEXT NOT NULL,
        datosJson   TEXT NOT NULL
      )
    ''');
  }
}

class LocalStorageService {
  static const _duracion = Duration(days: 7);

  static Future<void> guardarJuegoSeleccionado({
    required String usuarioId,
    required String categoriaNombre,
    required String tipoClave,
    required int juegoId,
    required String juegoCodigo,
  }) async {
    final db = await AppDatabase.database;
    await db.insert(
      'juego_seleccionado',
      {
        'usuarioId': usuarioId,
        'categoriaNombre': categoriaNombre,
        'tipoClave': tipoClave,
        'juegoId': juegoId,
        'juegoCodigo': juegoCodigo,
        'guardadoEl': DateTime.now().toIso8601String(),
      },
      // Si ya existe la combinación, sobreescribir con el nuevo juego
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Devuelve la entrada guardada o null si no existe / ha expirado (> 7 días).
  static Future<EntradaJuegoGuardada?> obtenerJuegoGuardado({
    required String usuarioId,
    required String categoriaNombre,
    required String tipoClave,
  }) async {
    final db = await AppDatabase.database;
    final rows = await db.query(
      'juego_seleccionado',
      where: 'usuarioId = ? AND categoriaNombre = ? AND tipoClave = ?',
      whereArgs: [usuarioId, categoriaNombre, tipoClave],
      limit: 1,
    );

    if (rows.isEmpty) return null;

    final fila = rows.first;
    final guardadoEl = DateTime.parse(fila['guardadoEl'] as String);

    // Comprobar expiración
    if (DateTime.now().difference(guardadoEl) > _duracion) {
      await eliminarJuegoGuardado(
        usuarioId: usuarioId,
        categoriaNombre: categoriaNombre,
        tipoClave: tipoClave,
      );
      return null;
    }

    return EntradaJuegoGuardada(
      juegoId: fila['juegoId'] as int,
      juegoCodigo: fila['juegoCodigo'] as String,
      guardadoEl: guardadoEl,
    );
  }

  static Future<void> eliminarJuegoGuardado({
    required String usuarioId,
    required String categoriaNombre,
    required String tipoClave,
  }) async {
    final db = await AppDatabase.database;
    await db.delete(
      'juego_seleccionado',
      where: 'usuarioId = ? AND categoriaNombre = ? AND tipoClave = ?',
      whereArgs: [usuarioId, categoriaNombre, tipoClave],
    );
  }

  /// Limpia las de todos los usuarios (la expiración no depende de quién sea).
  static Future<void> limpiarExpiradas() async {
    final db = await AppDatabase.database;

    // Calcular la fecha límite y borrar en una sola query SQL
    final limite = DateTime.now().subtract(_duracion).toIso8601String();
    await db.delete(
      'juego_seleccionado',
      where: 'guardadoEl < ?',
      whereArgs: [limite],
    );
  }


  /// Marca la actividad de (usuarioId, categoriaNombre, tipoClave) como hecha.
  /// Internamente es lo mismo que guardarJuegoSeleccionado, pero el nombre
  /// deja claro que el efecto es ocultarla durante 7 días para ese usuario.
  static Future<void> marcarHecha({
    required String usuarioId,
    required String categoriaNombre,
    required String tipoClave,
    required int juegoId,
    required String juegoCodigo,
  }) =>
      guardarJuegoSeleccionado(
        usuarioId: usuarioId,
        categoriaNombre: categoriaNombre,
        tipoClave: tipoClave,
        juegoId: juegoId,
        juegoCodigo: juegoCodigo,
      );

  /// true si ese usuario ya hizo esa actividad y no ha caducado (sigue dentro
  /// de los 7 días). obtenerJuegoGuardado borra la fila si ya expiró.
  static Future<bool> estaHecha({
    required String usuarioId,
    required String categoriaNombre,
    required String tipoClave,
  }) async =>
      (await obtenerJuegoGuardado(
        usuarioId: usuarioId,
        categoriaNombre: categoriaNombre,
        tipoClave: tipoClave,
      )) !=
          null;
}


class JuegoGuardadoDB {
  static Future<void> guardar({
    required String usuarioId,
    required String codigo,
    required String titulo,
    required String tipoNombre,
    required String tipoClave,
  }) async {
    final db = await AppDatabase.database;
    await db.insert(
      'juego_guardado',
      {
        'usuarioId':  usuarioId,
        'codigo':     codigo,
        'titulo':     titulo,
        'tipoNombre': tipoNombre,
        'tipoClave':  tipoClave,
        'guardadoEl': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<void> eliminar({
    required String usuarioId,
    required String codigo,
  }) async {
    final db = await AppDatabase.database;
    await db.delete('juego_guardado',
        where: 'usuarioId = ? AND codigo = ?', whereArgs: [usuarioId, codigo]);
  }

  static Future<bool> estaGuardado({
    required String usuarioId,
    required String codigo,
  }) async {
    final db = await AppDatabase.database;
    final rows = await db.query('juego_guardado',
        where: 'usuarioId = ? AND codigo = ?',
        whereArgs: [usuarioId, codigo], limit: 1);
    return rows.isNotEmpty;
  }

  static Future<List<JuegoGuardado>> obtenerTodos(String usuarioId) async {
    final db = await AppDatabase.database;
    final rows = await db.query('juego_guardado',
        where: 'usuarioId = ?', whereArgs: [usuarioId],
        orderBy: 'guardadoEl DESC');
    return rows.map(JuegoGuardado.fromRow).toList();
  }
}


class JuegoGuardado {
  final String codigo;
  final String titulo;
  final String tipoNombre;
  final String tipoClave;
  final DateTime guardadoEl;

  const JuegoGuardado({
    required this.codigo,
    required this.titulo,
    required this.tipoNombre,
    required this.tipoClave,
    required this.guardadoEl,
  });

  factory JuegoGuardado.fromRow(Map<String, dynamic> r) => JuegoGuardado(
    codigo:     r['codigo'] as String,
    titulo:     r['titulo'] as String,
    tipoNombre: r['tipoNombre'] as String,
    tipoClave:  r['tipoClave'] as String,
    guardadoEl: DateTime.parse(r['guardadoEl'] as String),
  );
}


class EntradaJuegoGuardada {
  final int juegoId;
  final String juegoCodigo;
  final DateTime guardadoEl;

  const EntradaJuegoGuardada({
    required this.juegoId,
    required this.juegoCodigo,
    required this.guardadoEl,
  });
}


class SesionDB {
  static Future<void> guardar({
    required String usuarioId,
    required String datosJson,
  }) async {
    final db = await AppDatabase.database;
    await db.insert(
      'sesion',
      {
        'id': 1,
        'usuarioId': usuarioId,
        'datosJson': datosJson,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Devuelve null si no hay sesión guardada.
  static Future<Map<String, dynamic>?> obtener() async {
    final db = await AppDatabase.database;
    final rows = await db.query('sesion', where: 'id = 1', limit: 1);
    if (rows.isEmpty) return null;
    return rows.first;
  }

  static Future<bool> haySesion() async {
    final sesion = await obtener();
    return sesion != null;
  }

  static Future<void> borrar() async {
    final db = await AppDatabase.database;
    await db.delete('sesion', where: 'id = 1');
  }
}