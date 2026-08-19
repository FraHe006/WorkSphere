import 'dart:convert';
import 'package:http/http.dart' as http;
import 'usuario_model.dart';

class ApiService {
  static const String _baseUrl = 'http://dam2.colexio-karbo.com:6101/api';

  // POST /api/usuarios/login
  static Future<Usuario> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/usuarios/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return Usuario.fromJson(data);
    }

    throw Exception(data['error'] ?? 'Error al iniciar sesión');
  }

  // POST /api/usuarios
  static Future<String> registrar(String nombre, String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/usuarios'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nombre': nombre, 'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 201) {
      return data['usuarioId'] as String;
    }

    throw Exception(data['error'] ?? 'Error al registrar usuario');
  }

  // GET /api/usuarios/existe-email/:email
  static Future<bool> existeEmail(String email) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/usuarios/existe-email/${Uri.encodeComponent(email)}'),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return data['existe'] as bool;
    }

    throw Exception(data['error'] ?? 'Error al verificar email');
  }

  // GET /api/usuarios/:id/vidas
  static Future<Map<String, dynamic>> obtenerVidas(String id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/usuarios/$id/vidas'),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return data; // { vidas: int, racha: int }
    }

    throw Exception(data['error'] ?? 'Error al obtener vidas');
  }

  // POST /api/usuarios/:id/perder-vida
  /// [tipo] = 'conversacion' (resta 2) o cualquier otro valor (resta 1)
  static Future<Map<String, dynamic>> perderVida(String id, String tipo) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/usuarios/$id/perder-vida'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'tipo': tipo}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return data; // { vidas: int, racha: int }
    }

    throw Exception(data['error'] ?? 'Error al actualizar vidas');
  }

  // POST /api/usuarios/:id/incrementar-racha
  static Future<Map<String, dynamic>> incrementarRacha(String id) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/usuarios/$id/incrementar-racha'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return data; // { vidas: int, racha: int }
    }

    throw Exception(data['error'] ?? 'Error al actualizar racha');
  }

  // GET /api/usuarios/:id
  static Future<Usuario> obtenerUsuario(String id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/usuarios/$id'),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return Usuario.fromJson(data);
    }

    throw Exception(data['error'] ?? 'Usuario no encontrado');
  }

  // PUT /api/usuarios/:id
  static Future<void> actualizarUsuario({
    required String id,
    required String nombre,
    required String email,
    String? password,
    String? imagenPerfil,
    String? descripcion,
  }) async {
    final body = <String, dynamic>{
      'nombre': nombre,
      'email': email,
      if (password != null) 'password': password,
      if (imagenPerfil != null) 'imagenPerfil': imagenPerfil,
      if (descripcion != null) 'descripcion': descripcion,
    };

    final response = await http.put(
      Uri.parse('$_baseUrl/usuarios/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Error al actualizar usuario');
    }
  }
}