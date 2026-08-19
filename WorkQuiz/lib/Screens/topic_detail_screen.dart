import 'dart:math';
import 'package:flutter/material.dart';
import '../Services/Juegos/game_service.dart';
import '../Services/SQLite/AppDatabase.dart';
import '../Services/InicioSesion/auth_service.dart';
import 'Juegos/VerdaderoFalsoScreen.dart';
import 'Juegos/UnirConceptosScreen.dart';
import 'Juegos/RellenarFrasesScreen.dart';
import 'Juegos/ConversacionScreen.dart';
import '../app_theme.dart';

// Tipos de juego disponibles con sus colores e iconos
const List<Map<String, dynamic>> _kTipos = [
  { 'clave': 'verdadero_falso', 'titulo': 'Verdadero o Falso',
    'icon': Icons.check_circle_outline, 'color1': Color(0xFF1565C0), 'color2': Color(0xFF42A5F5) },
  { 'clave': 'unir_conceptos',  'titulo': 'Unir Conceptos',
    'icon': Icons.account_tree_outlined, 'color1': Color(0xFF2E7D32), 'color2': Color(0xFF66BB6A) },
  { 'clave': 'rellenar_frase',  'titulo': 'Rellenar Frase',
    'icon': Icons.edit_outlined, 'color1': Color(0xFF6A1B9A), 'color2': Color(0xFFAB47BC) },
  { 'clave': 'conversacion',    'titulo': 'Conversación',
    'icon': Icons.chat_bubble_outline, 'color1': Color(0xFFE65100), 'color2': Color(0xFFFFA726) },
];

// Agrupa el tipo de juego con el juego concreto elegido al azar
class _TipoConJuego {
  final Map<String, dynamic> tipo;
  final int juegoId;
  final String juegoCodigo;
  const _TipoConJuego({required this.tipo, required this.juegoId, required this.juegoCodigo});
}

class TopicDetailScreen extends StatefulWidget {
  final Categoria categoria;
  final Color color1, color2;
  const TopicDetailScreen({Key? key, required this.categoria,
    required this.color1, required this.color2}) : super(key: key);
  @override State<TopicDetailScreen> createState() => _TopicDetailScreenState();
}

class _TopicDetailScreenState extends State<TopicDetailScreen> {
  bool _loading = true;
  String? _error;
  List<_TipoConJuego> _tipos = [];

  @override void initState() { super.initState(); _loadJuegos(); }

  Future<void> _loadJuegos() async {
    try {
      final rng = Random();
      final usuarioId = AuthService.usuarioActual?.id;

      final futures = _kTipos.map((tipo) async {
        final clave = tipo['clave'] as String;

        // Si el usuario ya jugó este tipo esta semana, no lo mostramos
        if (usuarioId != null) {
          final hecha = await LocalStorageService.estaHecha(
            usuarioId: usuarioId,
            categoriaNombre: widget.categoria.nombre,
            tipoClave: clave,
          );
          if (hecha) return null;
        }

        // Obtener juegos disponibles y elegir uno al azar
        final juegos = await JuegosService.getJuegosPorCategoria(
            widget.categoria.nombre, tipo: clave);
        final validos = juegos.where((j) => j.id > 0).toList();
        if (validos.isEmpty) return null;

        final elegido = validos[rng.nextInt(validos.length)];
        return _TipoConJuego(
            tipo: tipo, juegoId: elegido.id, juegoCodigo: elegido.codigo);
      });

      final res = await Future.wait(futures);
      if (mounted) setState(() { _tipos = res.whereType<_TipoConJuego>().toList(); _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _abrir(_TipoConJuego item) {
    final clave = item.tipo['clave'] as String;
    final usuarioId = AuthService.usuarioActual?.id;

    if (usuarioId != null) {
      // Marcar como hecha para ocultar este tipo durante 7 días
      LocalStorageService.marcarHecha(
        usuarioId: usuarioId,
        categoriaNombre: widget.categoria.nombre,
        tipoClave: clave,
        juegoId: item.juegoId,
        juegoCodigo: item.juegoCodigo,
      );
    }

    Widget? s;
    switch (clave) {
      case 'verdadero_falso': s = VerdaderoFalsoScreen(juegoCodigo: item.juegoCodigo); break;
      case 'unir_conceptos':  s = UnirConceptosScreen(juegoCodigo: item.juegoCodigo);  break;
      case 'rellenar_frase':  s = RellenarFrasesScreen(juegoCodigo: item.juegoCodigo); break;
      case 'conversacion':    s = ConversacionScreen(juegoCodigo: item.juegoCodigo);   break;
    }

    if (s != null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => s!));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        _buildHeader(),
        Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null ? _buildError()
            : _tipos.isEmpty  ? _buildEmpty()
            : _buildGrid()),
      ]),
    );
  }

  // Header con gradiente, botón atrás y círculos decorativos
  Widget _buildHeader() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [widget.color1, widget.color2],
            begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: SafeArea(
        bottom: false,
        child: Stack(children: [
          // Círculos decorativos de fondo
          Positioned(top: -30, right: -30, child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.09)))),
          Positioned(bottom: -20, left: -20, child: Container(
              width: 100, height: 100,
              decoration: BoxDecoration(shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.06)))),
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 16, 20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Fila superior: botón atrás + nombre de categoría
              Row(children: [
                IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                    onPressed: () => Navigator.pop(context)),
                Expanded(child: Text(widget.categoria.nombre,
                    style: const TextStyle(color: Colors.white, fontSize: 15,
                        fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
              ]),
              const SizedBox(height: 8),
              // Fila inferior: icono + nombre grande + subtítulo
              Padding(
                padding: const EdgeInsets.only(left: 16),
                child: Row(children: [
                  Container(width: 48, height: 48,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle),
                      child: Center(child: Icon(Icons.category_outlined, color: Colors.white, size: 26))),
                  const SizedBox(width: 14),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(widget.categoria.nombre,
                        style: const TextStyle(color: Colors.white, fontSize: 20,
                            fontWeight: FontWeight.bold, letterSpacing: -0.3)),
                    Text('Elige un tipo de juego',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                  ]),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  // Grid de 2 columnas con las tarjetas de tipo de juego
  Widget _buildGrid() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: _tipos.length == 1 ? 2.2 : 1.05,
        children: _tipos.map((t) => _buildCard(t)).toList(),
      ),
    );
  }

  // Tarjeta individual de tipo de juego
  Widget _buildCard(_TipoConJuego item) {
    final c1 = item.tipo['color1'] as Color;
    final c2 = item.tipo['color2'] as Color;
    return GestureDetector(
      onTap: () => _abrir(item),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [c1, c2],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: AppShadow.colored(c1),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              // Icono del tipo de juego
              Container(width: 40, height: 40,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle),
                  child: Center(child: Icon(item.tipo['icon'] as IconData,
                      color: Colors.white, size: 22))),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item.tipo['titulo'] as String,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold,
                        color: Colors.white)),
                const SizedBox(height: 5),
                // Botón "Jugar"
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(AppRadius.pill)),
                  child: Text('Jugar →', style: TextStyle(fontSize: 10,
                      color: Colors.white.withOpacity(0.9), fontWeight: FontWeight.w600)),
                ),
              ]),
            ]),
      ),
    );
  }

  // Pantalla de error con botón para reintentar
  Widget _buildError() => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
    Icon(Icons.error_outline, size: 40, color: Colors.red[300]),
    const SizedBox(height: 8),
    Text('No se pudieron cargar los juegos', style: TextStyle(color: Colors.grey[600])),
    const SizedBox(height: 8),
    OutlinedButton(onPressed: () { setState(() { _loading=true; _error=null; }); _loadJuegos(); },
        child: const Text('Reintentar')),
  ]));

  // Mensaje cuando no hay juegos disponibles en la categoría
  Widget _buildEmpty() => Center(child: Text('No hay juegos disponibles\nen esta categoría',
      textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])));
}