// ─────────────────────────────────────────────────────────────────────────────
// sandbox_screen.dart  —  REDISEÑADO
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';

import '../../Services/Juegos/game_service.dart';
import '../../Services/SQLite/AppDatabase.dart';
import '../../Services/InicioSesion/auth_service.dart';
import '../Juegos/VerdaderoFalsoScreen.dart';
import '../Juegos/UnirConceptosScreen.dart';
import '../Juegos/RellenarFrasesScreen.dart';
import '../Juegos/ConversacionScreen.dart';
import '../../app_theme.dart';

const Map<String, String> _kNombreAClave = {
  'Verdadero y Falso': 'verdadero_falso',
  'Unir Conceptos':    'unir_conceptos',
  'Rellenar Frases':   'rellenar_frase',
  'Conversacion':      'conversacion',
};

const Map<String, IconData> _kTipoIcono = {
  'verdadero_falso': Icons.check_circle_outline,
  'unir_conceptos':  Icons.account_tree_outlined,
  'rellenar_frase':  Icons.edit_outlined,
  'conversacion':    Icons.chat_bubble_outline,
};

const Map<String, Color> _kTipoColor = {
  'verdadero_falso': Color(0xFF1565C0),
  'unir_conceptos':  Color(0xFF2E7D32),
  'rellenar_frase':  Color(0xFF6A1B9A),
  'conversacion':    Color(0xFFE65100),
};

class SandboxScreen extends StatefulWidget {
  const SandboxScreen({Key? key}) : super(key: key);

  @override
  State<SandboxScreen> createState() => _SandboxScreenState();
}

class _SandboxScreenState extends State<SandboxScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _codigoCtrl = TextEditingController();

  bool _buscando = false;
  String? _error;
  Map<String, dynamic>? _juego;
  bool _guardado = false;

  List<JuegoGuardado> _guardados     = [];
  bool _cargandoGuardados            = true;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _tabs.addListener(() => setState(() {}));
    _cargarGuardados();
  }

  @override
  void dispose() {
    _tabs.dispose();
    _codigoCtrl.dispose();
    super.dispose();
  }

  // Cargar juegos guardados en local
  Future<void> _cargarGuardados() async {
    final uid = AuthService.usuarioActual?.id;
    final lista = uid == null
        ? <JuegoGuardado>[]
        : await JuegoGuardadoDB.obtenerTodos(uid);
    if (mounted) setState(() { _guardados = lista; _cargandoGuardados = false; });
  }

  // Cambiar guardado a no guardado, icono
  Future<void> _toggleGuardado() async {
    final uid = AuthService.usuarioActual?.id;
    if (uid == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inicia sesión para guardar actividades')));
      return;
    }
    final juego = _juego!;
    final codigo = juego['codigo'] as String;
    if (_guardado) {
      await JuegoGuardadoDB.eliminar(usuarioId: uid, codigo: codigo);
    } else {
      final tipoNombre = juego['tipo'] as String? ?? '';
      await JuegoGuardadoDB.guardar(
        usuarioId:  uid,
        codigo:     codigo,
        titulo:     juego['titulo'] as String,
        tipoNombre: tipoNombre,
        tipoClave:  _kNombreAClave[tipoNombre] ?? tipoNombre,
      );
    }
    await _cargarGuardados();
    if (mounted) setState(() => _guardado = !_guardado);
  }

  // Eliminar guardado
  Future<void> _eliminarGuardado(String codigo) async {
    final uid = AuthService.usuarioActual?.id;
    if (uid == null) return;
    await JuegoGuardadoDB.eliminar(usuarioId: uid, codigo: codigo);
    await _cargarGuardados();
  }

  // Buscar juego por código
  Future<void> _buscar() async {
    final codigo = _codigoCtrl.text.trim().toUpperCase();
    if (codigo.isEmpty) return;
    FocusScope.of(context).unfocus();
    setState(() { _buscando = true; _error = null; _juego = null; _guardado = false; });
    try {
      final data       = await JuegosService.getJuegoPorCodigo(codigo);
      final uid        = AuthService.usuarioActual?.id;
      final yaGuardado = uid == null
          ? false
          : await JuegoGuardadoDB.estaGuardado(usuarioId: uid, codigo: codigo);
      if (mounted) setState(() { _juego = data; _guardado = yaGuardado; _buscando = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _buscando = false; });
    }
  }

  // Abrir juego
  void _abrirJuego(String codigo, String clave) {
    Widget? screen;
    switch (clave) {
      case 'verdadero_falso': screen = VerdaderoFalsoScreen(juegoCodigo: codigo); break;
      case 'unir_conceptos':  screen = UnirConceptosScreen(juegoCodigo: codigo);  break;
      case 'rellenar_frase':  screen = RellenarFrasesScreen(juegoCodigo: codigo); break;
      case 'conversacion':    screen = ConversacionScreen(juegoCodigo: codigo);   break;
    }
    if (screen != null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen!));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tipo de juego no soportado aún')));
    }
  }

  // Interfaz
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar(
            expandedHeight: 130,
            pinned: true,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppColors.heroGradient),
                child: Stack(
                  children: [
                    Positioned(
                      top: -40, right: -40,
                      child: Container(
                        width: 200, height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.07),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            bottom: TabBar(
              controller: _tabs,
              indicatorColor: Colors.white,
              indicatorWeight: 3,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white54,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: const [
                Tab(icon: Icon(Icons.search_rounded, size: 18), text: 'Buscar'),
                Tab(icon: Icon(Icons.bookmark_rounded, size: 18), text: 'Guardados'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabs,
          children: [
            _buildBusqueda(),
            _buildGuardados(),
          ],
        ),
      ),
    );
  }

  // Espacio de búsqueda

  Widget _buildBusqueda() {
    return Column(
      children: [
        // Barra de búsqueda
        Container(
          color: AppColors.primary,
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
          child: AppCard(
            padding: const EdgeInsets.all(12),
            shadows: [],
            borderColor: AppColors.border,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _codigoCtrl,
                    textCapitalization: TextCapitalization.characters,
                    onSubmitted: (_) => _buscar(),
                    decoration: const InputDecoration(
                      hintText: 'Código de la actividad (ej: VF-2024-00001)',
                      prefixIcon: Icon(Icons.qr_code_rounded),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _buscando ? null : _buscar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md)),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      minimumSize: Size.zero,
                    ),
                    child: _buscando
                        ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.search_rounded, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ),

        Expanded(
          child: _error != null
              ? _buildSearchError()
              : _juego != null
              ? _buildTarjetaJuego(_juego!, mostrarGuardar: true)
              : _buildVacio(),
        ),
      ],
    );
  }

  // Espacio de juegos guardados

  Widget _buildGuardados() {
    if (_cargandoGuardados) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_guardados.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.bookmark_border_rounded, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 12),
            Text(
              'Aún no tienes actividades guardadas.\nBúscalos por código y guárdalos.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted, fontSize: 14),
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _guardados.length,
      itemBuilder: (_, i) => _buildItemGuardado(_guardados[i]),
    );
  }

  // Mostrar juegos guardados
  Widget _buildItemGuardado(JuegoGuardado jg) {
    final color = _kTipoColor[jg.tipoClave] ?? AppColors.primary;
    final icono = _kTipoIcono[jg.tipoClave] ?? Icons.sports_esports;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadow.card,
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Center(child: Icon(icono, color: color, size: 22)),
        ),
        title: Text(jg.titulo,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(
          '${jg.tipoNombre} · ${jg.codigo}',
          style: TextStyle(fontSize: 11, color: Colors.grey[500]),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: Icon(Icons.play_arrow_rounded, color: color),
              onPressed: () => _abrirJuego(jg.codigo, jg.tipoClave),
              tooltip: 'Jugar',
            ),
            IconButton(
              icon: Icon(Icons.bookmark_remove_outlined, color: Colors.grey[400]),
              onPressed: () => _confirmarEliminar(jg),
              tooltip: 'Eliminar',
            ),
          ],
        ),
      ),
    );
  }

  // Confirmar eliminar juego de guardados
  void _confirmarEliminar(JuegoGuardado jg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
        title: const Text('Eliminar guardado'),
        content: Text('¿Quitar "${jg.titulo}" de tus guardados?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          TextButton(
            onPressed: () { Navigator.pop(context); _eliminarGuardado(jg.codigo); },
            child: const Text('Eliminar', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  // Resultado de búsqueda de juego por código

  Widget _buildTarjetaJuego(Map<String, dynamic> juego, {bool mostrarGuardar = false}) {
    final codigo     = juego['codigo'] as String;
    final titulo     = juego['titulo'] as String;
    final tipoNombre = juego['tipo'] as String? ?? '';
    final clave      = _kNombreAClave[tipoNombre] ?? tipoNombre;
    final color      = _kTipoColor[clave] ?? AppColors.primary;
    final icono      = _kTipoIcono[clave] ?? Icons.sports_esports;
    final validado   = juego['validado'] == true || juego['validado'] == 1;
    final autor      = juego['correo_autor'] as String? ?? '';
    final items = (juego['preguntas'] as List?)?.length ??
        (juego['parejas'] as List?)?.length ??
        (juego['dialogos'] as List?)?.length ?? 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withOpacity(0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppRadius.xl),
              boxShadow: AppShadow.colored(color),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Center(child: Icon(icono, color: Colors.white, size: 24)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tipoNombre,
                              style: TextStyle(
                                  fontSize: 11, color: Colors.white.withOpacity(0.8))),
                          Text(titulo,
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: validado ? Colors.green[400] : Colors.orange[400],
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      child: Text(
                        validado ? 'Validado' : 'Pendiente',
                        style: const TextStyle(
                            fontSize: 10,
                            color: Colors.white,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 12, runSpacing: 6,
                  children: [
                    _chip(Icons.qr_code, codigo),
                    if (autor.isNotEmpty) _chip(Icons.person_outline, autor),
                    if (items > 0) _chip(Icons.format_list_numbered,
                        '$items elemento${items == 1 ? '' : 's'}'),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _abrirJuego(codigo, clave),
                  icon: const Icon(Icons.play_arrow_rounded, size: 20),
                  label: const Text('Jugar'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    minimumSize: const Size(0, 50),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md)),
                    elevation: 0,
                  ),
                ),
              ),
              if (mostrarGuardar) ...[
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  onPressed: _toggleGuardado,
                  icon: Icon(
                    _guardado ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                    color: color, size: 18,
                  ),
                  label: Text(
                    _guardado ? 'Guardado' : 'Guardar',
                    style: TextStyle(color: color),
                  ),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 50),
                    side: BorderSide(color: color, width: 1.5),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md)),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(IconData icono, String texto) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: Colors.white.withOpacity(0.2),
      borderRadius: BorderRadius.circular(AppRadius.pill),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icono, size: 12, color: Colors.white.withOpacity(0.9)),
        const SizedBox(width: 4),
        Text(texto, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.9))),
      ],
    ),
  );

  // Sin juegos buscados
  Widget _buildVacio() => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.sports_esports_outlined, size: 64, color: Colors.grey[300]),
        const SizedBox(height: 12),
        Text(
          'Introduce un código para\ncargar una actividad',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.textMuted, fontSize: 14),
        ),
      ],
    ),
  );

  // Error de búsqueda
  Widget _buildSearchError() {
    final esNotFound = _error!.contains('no encontrado');
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(esNotFound ? Icons.search_off : Icons.wifi_off,
                size: 52, color: Colors.red[300]),
            const SizedBox(height: 12),
            Text(
              esNotFound
                  ? 'No se encontró ningún juego\ncon ese código'
                  : 'Error al conectar con el servidor',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted, fontSize: 14),
            ),
            if (!esNotFound) ...[
              const SizedBox(height: 12),
              OutlinedButton(onPressed: _buscar, child: const Text('Reintentar')),
            ],
          ],
        ),
      ),
    );
  }
}