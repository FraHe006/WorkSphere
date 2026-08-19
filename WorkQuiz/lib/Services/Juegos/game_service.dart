// ─────────────────────────────────────────────────────────────────────────────
// game_service.dart  —  ACTUALIZADO
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:convert';
import 'package:http/http.dart' as http;

class Categoria {
  final int id;
  final String nombre;

  const Categoria({required this.id, required this.nombre});

  factory Categoria.fromJson(Map<String, dynamic> j) =>
      Categoria(id: j['id'] as int, nombre: j['categoria'] as String);
}

class JuegoResumen {
  final int id;
  final String codigo;
  final String titulo;
  final String tipo; // nombre legible

  const JuegoResumen({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.tipo,
  });

  factory JuegoResumen.fromJson(Map<String, dynamic> j) => JuegoResumen(
    id: j['id'] as int,
    codigo: j['codigo'] as String,
    titulo: j['titulo'] as String,
    tipo: j['tipo'] as String,
  );
}

/// Pregunta de Verdadero / Falso
class VFPregunta {
  final int id;
  final int orden;
  final String enunciado;
  final bool respuesta; // true = verdadero, false = falso
  final String? explicacion;

  const VFPregunta({
    required this.id,
    required this.orden,
    required this.enunciado,
    required this.respuesta,
    this.explicacion,
  });

  factory VFPregunta.fromJson(Map<String, dynamic> j) => VFPregunta(
    id: j['id'] as int,
    orden: j['orden'] as int,
    enunciado: j['enunciado'] as String,
    // La API devuelve 1/0 (MySQL tinyint) o true/false
    respuesta: j['respuesta'] == true || j['respuesta'] == 1,
    explicacion: j['explicacion'] as String?,
  );
}

/// Pareja de Unir Conceptos
class UCPareja {
  final int id;
  final int orden;
  final String termino;
  final String definicion;
  final String? explicacion;

  const UCPareja({
    required this.id,
    required this.orden,
    required this.termino,
    required this.definicion,
    this.explicacion,
  });

  factory UCPareja.fromJson(Map<String, dynamic> j) => UCPareja(
    id: j['id'] as int,
    orden: j['orden'] as int,
    termino: j['termino'] as String,
    definicion: j['definicion'] as String,
    explicacion: j['explicacion'] as String?,
  );
}

/// Pregunta de Rellenar Frase
class RFPregunta {
  final int id;
  final int orden;
  final String frase; // contiene [___] donde va la respuesta
  final String respuesta;
  final String? explicacion;

  const RFPregunta({
    required this.id,
    required this.orden,
    required this.frase,
    required this.respuesta,
    this.explicacion,
  });

  factory RFPregunta.fromJson(Map<String, dynamic> j) => RFPregunta(
    id: j['id'] as int,
    orden: j['orden'] as int,
    frase: j['frase'] as String,
    respuesta: j['respuesta'] as String,
    explicacion: j['explicacion'] as String?,
  );
}

/// Opción de un diálogo de Conversación
class ConvOpcion {
  final int id;
  final String letra; // 'A' o 'B'
  final String texto;
  final String? explicacion;
  final int pesoA;
  final int pesoB;
  final int pesoC;

  const ConvOpcion({
    required this.id,
    required this.letra,
    required this.texto,
    this.explicacion,
    required this.pesoA,
    required this.pesoB,
    required this.pesoC,
  });

  factory ConvOpcion.fromJson(Map<String, dynamic> j) => ConvOpcion(
    id: j['id'] as int,
    letra: j['letra'] as String,
    texto: j['texto'] as String,
    explicacion: j['explicacion'] as String?,
    pesoA: (j['peso_a'] as num).toInt(),
    pesoB: (j['peso_b'] as num).toInt(),
    pesoC: (j['peso_c'] as num).toInt(),
  );
}

/// Diálogo de Conversación
class ConvDialogo {
  final int id;
  final int orden;
  final String prompt;
  final List<ConvOpcion> opciones;

  const ConvDialogo({
    required this.id,
    required this.orden,
    required this.prompt,
    required this.opciones,
  });

  factory ConvDialogo.fromJson(Map<String, dynamic> j) => ConvDialogo(
    id: j['id'] as int,
    orden: j['orden'] as int,
    prompt: j['prompt'] as String,
    opciones: (j['opciones'] as List<dynamic>)
        .map((e) => ConvOpcion.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

/// Puntuador (perfil de resultado) de Conversación
class ConvPuntuador {
  final int id;
  final String letra; // 'A', 'B' o 'C'
  final String nombre;
  final int rangoMin;
  final int rangoMax;
  final String desenlace; // texto del resultado final

  const ConvPuntuador({
    required this.id,
    required this.letra,
    required this.nombre,
    required this.rangoMin,
    required this.rangoMax,
    required this.desenlace,
  });

  factory ConvPuntuador.fromJson(Map<String, dynamic> j) => ConvPuntuador(
    id: j['id'] as int,
    letra: j['letra'] as String,
    nombre: j['nombre'] as String,
    rangoMin: (j['rango_min'] as num).toInt(),
    rangoMax: (j['rango_max'] as num).toInt(),
    desenlace: j['desenlace'] as String,
  );
}

/// Juego completo de Conversación
class JuegoConversacion {
  final int id;
  final String codigo;
  final String titulo;
  final List<ConvPuntuador> puntuadores;
  final List<ConvDialogo> dialogos;
  final String? despedida;

  const JuegoConversacion({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.puntuadores,
    required this.dialogos,
    this.despedida,
  });

  factory JuegoConversacion.fromJson(Map<String, dynamic> j) =>
      JuegoConversacion(
        id: j['id'] as int,
        codigo: j['codigo'] as String,
        titulo: j['titulo'] as String,
        puntuadores: (j['puntuadores'] as List<dynamic>)
            .map((e) => ConvPuntuador.fromJson(e as Map<String, dynamic>))
            .toList(),
        dialogos: (j['dialogos'] as List<dynamic>)
            .map((e) => ConvDialogo.fromJson(e as Map<String, dynamic>))
            .toList(),
        despedida: j['despedida'] as String?,
      );

  /// Devuelve el puntuador cuyo rango cubre [puntuacion], o null.
  ConvPuntuador? puntuadorParaPuntuacion(int puntuacion) {
    for (final p in puntuadores) {
      if (puntuacion >= p.rangoMin && puntuacion <= p.rangoMax) return p;
    }
    return puntuadores.isNotEmpty ? puntuadores.last : null;
  }
}

/// Juego completo de Rellenar Frases
class JuegoRellenarFrases {
  final int id;
  final String codigo;
  final String titulo;
  final List<RFPregunta> preguntas;

  const JuegoRellenarFrases({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.preguntas,
  });

  factory JuegoRellenarFrases.fromJson(Map<String, dynamic> j) =>
      JuegoRellenarFrases(
        id: j['id'] as int,
        codigo: j['codigo'] as String,
        titulo: j['titulo'] as String,
        preguntas: (j['preguntas'] as List<dynamic>)
            .map((e) => RFPregunta.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

/// Juego completo de Verdadero / Falso
class JuegoVerdaderoFalso {
  final int id;
  final String codigo;
  final String titulo;
  final List<VFPregunta> preguntas;

  const JuegoVerdaderoFalso({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.preguntas,
  });

  factory JuegoVerdaderoFalso.fromJson(Map<String, dynamic> j) =>
      JuegoVerdaderoFalso(
        id: j['id'] as int,
        codigo: j['codigo'] as String,
        titulo: j['titulo'] as String,
        preguntas: (j['preguntas'] as List<dynamic>)
            .map((e) => VFPregunta.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

/// Juego completo de Unir Conceptos
class JuegoUnirConceptos {
  final int id;
  final String codigo;
  final String titulo;
  final List<UCPareja> parejas;

  const JuegoUnirConceptos({
    required this.id,
    required this.codigo,
    required this.titulo,
    required this.parejas,
  });

  factory JuegoUnirConceptos.fromJson(Map<String, dynamic> j) =>
      JuegoUnirConceptos(
        id: j['id'] as int,
        codigo: j['codigo'] as String,
        titulo: j['titulo'] as String,
        parejas: (j['parejas'] as List<dynamic>)
            .map((e) => UCPareja.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class JuegosService {
  static const String _base = 'http://dam2.colexio-karbo.com:6101/api';

  /// Devuelve todas las categorías disponibles.
  static Future<List<Categoria>> getCategorias() async {
    final uri = Uri.parse('$_base/juegos/categorias');
    final res = await http.get(uri);

    if (res.statusCode != 200) throw Exception('Error al cargar categorías');

    final List<dynamic> json = jsonDecode(res.body) as List<dynamic>;
    return json
        .map((e) => Categoria.fromJson(e as Map<String, dynamic>))
        .toList();
  }


  /// Devuelve los juegos validados de una categoría, opcionalmente filtrados por tipo.
  /// [tipo] es la clave del tipo (ej: 'verdadero_falso', 'unir_conceptos').
  static Future<List<JuegoResumen>> getJuegosPorCategoria(
      String categoria, {
        String? tipo,
      }) async {
    final params = <String, String>{
      'categoria': categoria,
      'validado': 'true',
      if (tipo != null) 'tipo': tipo,
    };

    final uri = Uri.parse('$_base/juegos').replace(queryParameters: params);
    final res = await http.get(uri);

    if (res.statusCode != 200) throw Exception('Error al cargar juegos');

    final List<dynamic> json = jsonDecode(res.body) as List<dynamic>;
    return json
        .map((e) => JuegoResumen.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // ── Juego completo por código ─────────────────────────────────────────────

  /// Obtiene el JSON completo de un juego (incluyendo preguntas/parejas)
  /// a partir de su código (ej: "VF-2024-00001").
  static Future<Map<String, dynamic>> getJuegoPorCodigo(String codigo) async {
    final uri = Uri.parse('$_base/juegos/$codigo');
    final res = await http.get(uri);

    if (res.statusCode == 404) throw Exception('Juego no encontrado');
    if (res.statusCode != 200) throw Exception('Error al cargar el juego');

    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  /// Obtiene y parsea un juego de Verdadero/Falso por su código.
  static Future<JuegoVerdaderoFalso> getVerdaderoFalso(String codigo) async {
    final data = await getJuegoPorCodigo(codigo);
    return JuegoVerdaderoFalso.fromJson(data);
  }

  /// Obtiene y parsea un juego de Unir Conceptos por su código.
  static Future<JuegoUnirConceptos> getUnirConceptos(String codigo) async {
    final data = await getJuegoPorCodigo(codigo);
    return JuegoUnirConceptos.fromJson(data);
  }

  /// Obtiene y parsea un juego de Rellenar Frases por su código.
  static Future<JuegoRellenarFrases> getRellenarFrases(String codigo) async {
    final data = await getJuegoPorCodigo(codigo);
    return JuegoRellenarFrases.fromJson(data);
  }

  /// Obtiene y parsea un juego de Conversación por su código.
  static Future<JuegoConversacion> getConversacion(String codigo) async {
    final data = await getJuegoPorCodigo(codigo);
    return JuegoConversacion.fromJson(data);
  }
}