import 'package:flutter/material.dart';
import '../../Services/Juegos/game_service.dart';
import '../../app_theme.dart';
import 'game_widgets.dart';

const _kColor1   = Color(0xFFE65100);
const _kColor2   = Color(0xFFFFA726);
const _kBurbujaA = Color(0xFF1565C0);
const _kBurbujaB = Color(0xFF2E7D32);

enum _TipoMsg { sistema, usuarioA, usuarioB, explicacion }

class _Msg {
  final _TipoMsg tipo;
  final String texto;
  const _Msg(this.tipo, this.texto);
}

class ConversacionScreen extends StatefulWidget {
  final String juegoCodigo;
  const ConversacionScreen({Key? key, required this.juegoCodigo}) : super(key: key);
  @override State<ConversacionScreen> createState() => _ConversacionScreenState();
}

class _ConversacionScreenState extends State<ConversacionScreen> {
  bool _loading = true; String? _error; JuegoConversacion? _juego;
  int _dialogoActual = 0; bool _esperando = true;
  final List<_Msg> _msgs = [];
  final Map<String, int> _pts = {'A': 0, 'B': 0, 'C': 0};
  final _scroll = ScrollController();

  @override void initState() { super.initState(); _cargarJuego(); }
  @override void dispose() { _scroll.dispose(); super.dispose(); }

  // Cargar juego desde el service
  Future<void> _cargarJuego() async {
    try {
      final j = await JuegosService.getConversacion(widget.juegoCodigo);
      if (mounted) { setState(() { _juego=j; _loading=false; }); _emitirPrompt(); }
    } catch (e) { if (mounted) setState(() { _error=e.toString(); _loading=false; }); }
  }

  // Mostrar prompt al comienzo de la actividad
  void _emitirPrompt() {
    final d = _juego!.dialogos[_dialogoActual];
    setState(() { _msgs.add(_Msg(_TipoMsg.sistema, d.prompt)); _esperando=true; });
    _scrollEnd();
  }

  // Mostrar opciones a elegir y el peso de cada una para el final
  void _elegir(ConvOpcion op) {
    if (!_esperando) return;
    setState(() {
      _pts['A'] = (_pts['A']??0) + op.pesoA;
      _pts['B'] = (_pts['B']??0) + op.pesoB;
      _pts['C'] = (_pts['C']??0) + op.pesoC;
      _msgs.add(_Msg(op.letra == 'A' ? _TipoMsg.usuarioA : _TipoMsg.usuarioB, op.texto));
      if (op.explicacion?.isNotEmpty == true)
        _msgs.add(_Msg(_TipoMsg.explicacion, op.explicacion!));
      _esperando = false;
    });
    _scrollEnd();
    Future.delayed(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      final next = _dialogoActual + 1;
      if (next < _juego!.dialogos.length) {
        setState(() => _dialogoActual = next);
        _emitirPrompt();
      } else { _fin(); }
    });
  }

  // Final de la actividad
  void _fin() {
    final despedida = _juego!.despedida;
    if (despedida != null && despedida.isNotEmpty) {
      setState(() { _msgs.add(_Msg(_TipoMsg.sistema, despedida)); _esperando=false; });
      _scrollEnd();
      Future.delayed(const Duration(milliseconds: 600), _irResultado);
    } else { _irResultado(); }
  }

  // Resultado
  void _irResultado() {
    if (!mounted) return;
    final letra = _pts.entries.reduce((a, b) => a.value >= b.value ? a : b).key;
    final pun = _juego!.puntuadores.firstWhere((p) => p.letra == letra,
        orElse: () => _juego!.puntuadores.first);
    Navigator.pushReplacement(context, MaterialPageRoute(
        builder: (_) => _ResultadoScreen(
            juego: _juego!, puntuador: pun, pts: Map.from(_pts))));
  }

  // Mantener widget al final
  void _scrollEnd() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (_scroll.hasClients) _scroll.animateTo(
        _scroll.position.maxScrollExtent + 200,
        duration: const Duration(milliseconds: 350), curve: Curves.easeOut);
  });


  // Interfaz
  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return GameErrorScreen(
        color: _kColor1, titulo: 'Conversación', error: _error!,
        onReintentar: () { setState(() { _loading=true; _error=null; }); _cargarJuego(); });

    final j = _juego!;
    final opciones = _esperando && _dialogoActual < j.dialogos.length
        ? j.dialogos[_dialogoActual].opciones : <ConvOpcion>[];

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: Column(children: [
        GameHeader(titulo: j.titulo, color1: _kColor1, color2: _kColor2,
            actual: _dialogoActual, total: j.dialogos.length),
        Expanded(child: ListView.builder(
          controller: _scroll,
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          itemCount: _msgs.length,
          itemBuilder: (_, i) => _buildMsg(_msgs[i]),
        )),
        if (opciones.isNotEmpty)
          Container(
            decoration: BoxDecoration(color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06),
                    blurRadius: 10, offset: const Offset(0, -2))]),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(children: opciones.map((o) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _buildOpcion(o),
            )).toList()),
          ),
      ]),
    );
  }

  // Mensaje diálog
  Widget _buildMsg(_Msg m) {
    switch (m.tipo) {
      case _TipoMsg.sistema:
        return Align(alignment: Alignment.centerLeft, child: Container(
          margin: const EdgeInsets.only(bottom: 10, right: 48),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF3E0),
            borderRadius: const BorderRadius.only(
                topRight: Radius.circular(16), bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(16), topLeft: Radius.circular(16)),
            border: Border.all(color: Colors.orange.shade200),
          ),
          child: Text(m.texto, style: const TextStyle(fontSize: 15, height: 1.5,
              color: Color(0xFF3E2723))),
        ));
      case _TipoMsg.usuarioA:
      case _TipoMsg.usuarioB:
        final c = m.tipo == _TipoMsg.usuarioA ? _kBurbujaA : _kBurbujaB;
        return Align(alignment: Alignment.centerRight, child: Container(
          margin: const EdgeInsets.only(bottom: 6, left: 48),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(color: c,
              borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16), bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(4), topRight: Radius.circular(16))),
          child: Text(m.texto, style: const TextStyle(fontSize: 14, height: 1.4,
              color: Colors.white)),
        ));
      case _TipoMsg.explicacion:
        return Align(alignment: Alignment.centerLeft, child: Container(
          margin: const EdgeInsets.only(bottom: 12, right: 32),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(color: Colors.grey[100],
              borderRadius: BorderRadius.circular(10)),
          child: Row(mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start, children: [
                Icon(Icons.info_outline, size: 14, color: Colors.grey[500]),
                const SizedBox(width: 6),
                Flexible(child: Text(m.texto, style: TextStyle(fontSize: 12,
                    color: Colors.grey[600], fontStyle: FontStyle.italic, height: 1.4))),
              ]),
        ));
    }
  }

  // Opciones
  Widget _buildOpcion(ConvOpcion op) {
    final c = op.letra == 'A' ? _kBurbujaA : _kBurbujaB;
    return GestureDetector(
      onTap: () => _elegir(op),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: c.withOpacity(0.06),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: c.withOpacity(0.3), width: 1.5),
        ),
        child: Row(children: [
          Container(width: 28, height: 28,
              decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [c, c.withOpacity(0.7)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight),
                  shape: BoxShape.circle),
              child: Center(child: Text(op.letra, style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)))),
          const SizedBox(width: 12),
          Expanded(child: Text(op.texto, style: TextStyle(fontSize: 14,
              color: c, fontWeight: FontWeight.w500))),
          Icon(Icons.arrow_forward_ios_rounded, size: 12, color: c.withOpacity(0.5)),
        ]),
      ),
    );
  }
}

// Resultado
class _ResultadoScreen extends StatelessWidget {
  final JuegoConversacion juego;
  final ConvPuntuador puntuador;
  final Map<String, int> pts;
  const _ResultadoScreen(
      {required this.juego, required this.puntuador, required this.pts});

  @override
  Widget build(BuildContext context) {
    final colores = {
      'A': const Color(0xFF1565C0),
      'B': const Color(0xFF2E7D32),
      'C': const Color(0xFF6A1B9A),
    };
    final c = colores[puntuador.letra] ?? _kColor1;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        Container(
          decoration: BoxDecoration(gradient: LinearGradient(
              colors: [c, c.withOpacity(0.7)],
              begin: Alignment.topLeft, end: Alignment.bottomRight)),
          child: SafeArea(bottom: false, child: Column(children: [
            Padding(padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
                child: Row(children: [
                  IconButton(
                      icon: const Icon(Icons.home_outlined, color: Colors.white, size: 20),
                      onPressed: () => Navigator.popUntil(context, (r) => r.isFirst)),
                  Expanded(child: Text(juego.titulo, style: const TextStyle(
                      color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis)),
                ])),
            Padding(padding: const EdgeInsets.fromLTRB(20, 4, 20, 20), child: Column(children: [
              const Icon(Icons.emoji_events, size: 52, color: Color(0xFFF9A825)),
              const SizedBox(height: 8),
              Text(puntuador.nombre, textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold,
                      color: Colors.white)),
              const SizedBox(height: 10),
              Wrap(spacing: 8, children: juego.puntuadores.map((p) {
                final esGanador = p.letra == puntuador.letra;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: esGanador ? Colors.white : Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Text('${p.letra}: ${pts[p.letra]??0} pts',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold,
                          color: esGanador ? c : Colors.white)),
                );
              }).toList()),
            ])),
          ])),
        ),
        Expanded(child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('TU RESULTADO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                color: Colors.grey[500], letterSpacing: 1)),
            const SizedBox(height: 10),
            AppCard(padding: const EdgeInsets.all(18), child: Text(puntuador.desenlace,
                style: const TextStyle(fontSize: 15, height: 1.6,
                    color: AppColors.textPrimary))),
            if (juego.puntuadores.length > 1) ...[
              const SizedBox(height: 24),
              Text('OTROS PERFILES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                  color: Colors.grey[500], letterSpacing: 1)),
              const SizedBox(height: 10),
              ...juego.puntuadores.where((p) => p.letra != puntuador.letra).map((p) =>
                  Container(margin: const EdgeInsets.only(bottom: 10),
                      child: AppCard(padding: const EdgeInsets.all(14), borderColor: AppColors.border,
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(p.nombre, style: const TextStyle(fontSize: 14,
                                fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                            const SizedBox(height: 4),
                            Text(p.desenlace, style: TextStyle(fontSize: 13,
                                color: Colors.grey[600], height: 1.4)),
                          ])))),
            ],
          ]),
        )),

        // Volver al inicio
        Padding(padding: const EdgeInsets.all(16), child: GradientButton(
            label: 'Volver al inicio', icon: Icons.home_outlined,
            onPressed: () => Navigator.pop(context))),
        const SizedBox(height: 8),
      ]),
    );
  }
}