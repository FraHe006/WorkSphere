import 'dart:convert';

import '../SQLite/AppDatabase.dart';
import 'usuario_model.dart';
import 'api_service.dart';

class AuthService {
  // Usuario en sesión (null = no hay sesión activa)
  static Usuario? _usuarioActual;

  static Usuario? get usuarioActual => _usuarioActual;
  static bool get haySesion => _usuarioActual != null;

  static Future<void> login(String email, String password) async {
    _usuarioActual = await ApiService.login(email, password);
    // Asegura que el usuario tenga vidas/racha inicializadas en Mongo
    await ApiService.obtenerVidas(_usuarioActual!.id);
    await SesionDB.guardar(
      usuarioId: _usuarioActual!.id,
      datosJson: jsonEncode(_usuarioActual!.toJson()), // necesitas un toJson()
    );
  }

  // Llamar al iniciar la app
  static Future<bool> restaurarSesion() async {
    final sesion = await SesionDB.obtener();
    if (sesion == null) return false;
    _usuarioActual = Usuario.fromJson(jsonDecode(sesion['datosJson'] as String));
    // Asegura que el usuario tenga vidas/racha inicializadas en Mongo
    // (y resetea vidas si ha pasado un día desde la última conexión)
    try {
      await ApiService.obtenerVidas(_usuarioActual!.id);
    } catch (_) {
      // Sin conexión: continuar igualmente con los datos locales
    }
    return true;
  }

  // Registrar cuenta nueva
  static Future<void> registrar(String nombre, String email, String password) async {
    final id = await ApiService.registrar(nombre, email, password);
    _usuarioActual = await ApiService.obtenerUsuario(id);
    // Asegura que el usuario tenga vidas/racha inicializadas en Mongo
    await ApiService.obtenerVidas(_usuarioActual!.id);
  }

  // Actualizar perfil
  static Future<void> actualizarPerfil({
    required String nombre,
    required String email,
    String? password,
    String? imagenPerfil,
    String? descripcion,
  }) async {
    await ApiService.actualizarUsuario(
      id: _usuarioActual!.id,
      nombre: nombre,
      email: email,
      password: password,
      imagenPerfil: imagenPerfil,
      descripcion: descripcion,
    );
    // Refrescamos el usuario local con los nuevos datos
    _usuarioActual = await ApiService.obtenerUsuario(_usuarioActual!.id);
  }

  // Cerrar sesión
  static Future<void> logout() async {
    _usuarioActual = null;
    await SesionDB.borrar();
  }
}