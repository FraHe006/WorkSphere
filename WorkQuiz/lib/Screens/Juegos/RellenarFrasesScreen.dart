import 'dart:async';
import 'package:flutter/material.dart';
import '../../Services/Juegos/game_service.dart';
import '../../app_theme.dart';
import 'game_widgets.dart';

const _kColor1      = Color(0xFF6A1B9A);
const _kColor2      = Color(0xFFAB47BC);
const int _kSegTot  = 60;
const int _kSegLetra = 10;

class RellenarFrasesScreen extends StatefulWidget {
  final String juegoCodigo;
  const RellenarFrasesScreen({Key? key, required this.juegoCodigo}) : super(key: key);
  @override State<RellenarFrasesScreen> createState() => _RellenarFrasesScreenState();
}

class _RellenarFrasesScreenState extends State<RellenarFrasesScreen> {
  bool _loading = true; String? _error; JuegoRellenarFrases? _juego;
  int _preguntaActual = 0;
  final _inputCtrl = TextEditingController();
  bool? _resultado;
  Timer? _timer;
  int _seg = _kSegTot, _letras = 0;
  bool _tiempoAgotado = false;

  @override void initState() { super.initState(); _cargarJuego(); }
  @override void dispose() { _timer?.cancel(); _inputCtrl.dispose(); super.dispose(); }

  // Cargar info de la actividad desdeel service
  Future<void> _cargarJuego() async {
    try {
      final j = await JuegosService.getRellenarFrases(widget.juegoCodigo);
      if (mounted) { setState(() { _juego=j; _loading=false; }); _iniciarTimer(); }
    } catch (e) { if (mounted) setState(() { _error=e.toString(); _loading=false; }); }
  }

  // Comenzar el timer al comenzar cada actividad y completar palabra con el tiempo
  void _iniciarTimer() {
    _timer?.cancel();
    setState(() { _seg=_kSegTot; _letras=0; _tiempoAgotado=false; });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      setState(() {
        _seg--;
        final transcurrido = _kSegTot - _seg;
        final debeRevelar  = transcurrido ~/ _kSegLetra;
        final resp = _juego!.preguntas[_preguntaActual].respuesta;
        if (debeRevelar > _letras && _letras < resp.length)
          _letras = debeRevelar.clamp(0, resp.length);
        if (_seg <= 0) { t.cancel(); _tiempoAgotado=true; _resultado=false; }
      });
    });
  }

  // Comprobar si la palabra es correcta
  void _comprobar() {
    if (_resultado != null) return;
    _timer?.cancel();
    final correcta = _juego!.preguntas[_preguntaActual].respuesta.trim().toLowerCase();
    setState(() { _resultado = _inputCtrl.text.trim().toLowerCase() == correcta; });
  }

  // Avanzar al siguiente ejercicio
  void _siguiente() {
    _inputCtrl.clear();
    setState(() { _preguntaActual++; _resultado=null; _tiempoAgotado=false; });
    if (_preguntaActual < _juego!.preguntas.length) _iniciarTimer();
  }

  // Dividir palabra
  List<String> _partir(String frase) {
    final idx = frase.indexOf('___');
    if (idx == -1) return [frase, ''];
    return [frase.substring(0, idx), frase.substring(idx + 3)];
  }

  // Mostrar info adicional
  void _mostrarInfo() {
    final exp = _juego!.preguntas[_preguntaActual].explicacion;
    showDialog(context: context, builder: (_) => GameInfoDialog(
      color: _kColor1,
      texto: exp?.isNotEmpty == true ? exp! : 'No hay información adicional.',
    ));
  }

  // Interfaz

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return GameErrorScreen(
        color: _kColor1, titulo: 'Rellenar Frases', error: _error!,
        onReintentar: () { setState(() { _loading=true; _error=null; }); _cargarJuego(); });

    final j = _juego!;
    if (_preguntaActual >= j.preguntas.length) return GameFinScreen(
      titulo: j.titulo, color1: _kColor1, color2: _kColor2,
      items: j.preguntas.map((p) {
        final partes = _partir(p.frase);
        return FinItem(
          enunciado: '${partes[0]}[${p.respuesta}]${partes[1]}',
          subtitulo: 'Respuesta: ${p.respuesta}',
          explicacion: p.explicacion,
        );
      }).toList(),
      onVolver: () => Navigator.pop(context),
    );

    final p = j.preguntas[_preguntaActual];
    final partes     = _partir(p.frase);
    final respondida = _resultado != null;
    final pista      = p.respuesta.substring(0, _letras.clamp(0, p.respuesta.length));
    final colorTimer = _seg > 20 ? _kColor1 : _seg > 10 ? Colors.orange : AppColors.danger;
    final esUltima   = _preguntaActual == j.preguntas.length - 1;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        GameHeader(titulo: j.titulo, color1: _kColor1, color2: _kColor2,
            actual: _preguntaActual, total: j.preguntas.length),
        Expanded(child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(children: [
              Text('Pregunta ${_preguntaActual + 1} de ${j.preguntas.length}',
                  style: TextStyle(fontSize: 13, color: Colors.grey[600],
                      fontWeight: FontWeight.w500)),
              const SizedBox(height: 16),
              // Frase con hueco
              AppCard(padding: const EdgeInsets.all(20), child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(style: const TextStyle(fontSize: 17, height: 1.6,
                    color: AppColors.textPrimary), children: [
                  TextSpan(text: partes[0]),
                  WidgetSpan(child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: _kColor1.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: _kColor1.withOpacity(0.4)),
                    ),
                    child: Text(pista.isNotEmpty ? pista : '  ?  ',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold,
                            color: _kColor1, letterSpacing: 1)),
                  )),
                  TextSpan(text: partes[1]),
                ]),
              )),
              const SizedBox(height: 20),
              if (respondida) _buildFeedback(p.respuesta),
              const Spacer(),
              if (!respondida) ...[
                TextField(
                  controller: _inputCtrl,
                  enabled: !respondida,
                  textCapitalization: TextCapitalization.sentences,
                  onSubmitted: (_) => _comprobar(),
                  decoration: InputDecoration(
                    hintText: 'Escribe la palabra que falta...',
                    prefixIcon: Icon(Icons.edit_outlined, color: _kColor1),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: const BorderSide(color: _kColor1, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              _buildBarra(respondida, esUltima, colorTimer),
              const SizedBox(height: 16),
            ]),
          ),
        )),
      ]),
    );
  }

  // Feedback cundo acabe el tiempo, la respuesta sea correcta, o la respuesta sea incorrecta
  Widget _buildFeedback(String respuesta) {
    final ok = _resultado!;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
      decoration: BoxDecoration(
        color: ok ? AppColors.success.withOpacity(0.08) : AppColors.danger.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: ok ? AppColors.success : AppColors.danger),
      ),
      child: Row(children: [
        Icon(ok ? Icons.check_circle : Icons.cancel,
            color: ok ? AppColors.success : AppColors.danger, size: 24),
        const SizedBox(width: 12),
        Expanded(child: Text(
          _tiempoAgotado ? 'Tiempo agotado. La respuesta era: $respuesta'
              : ok ? '¡Correcto!'
              : 'Incorrecto. La respuesta era: $respuesta',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
              color: ok ? AppColors.success : AppColors.danger),
        )),
      ]),
    );
  }


  Widget _buildBarra(bool respondida, bool esUltima, Color colorTimer) {
    if (!respondida) {
      return Row(children: [
        SizedBox(width: 52, height: 52, child: Stack(fit: StackFit.expand, children: [
          CircularProgressIndicator(
              value: _seg / _kSegTot, strokeWidth: 4,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(colorTimer)),
          Center(child: Text('$_seg', style: TextStyle(fontSize: 14,
              fontWeight: FontWeight.bold, color: colorTimer))),
        ])),
        const SizedBox(width: 12),
        Expanded(child: SizedBox(height: 48,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [_kColor1, _kColor2],
                  begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(AppRadius.md),
              boxShadow: AppShadow.colored(_kColor1),
            ),
            child: ElevatedButton.icon(
              onPressed: _comprobar,
              icon: const Icon(Icons.check_rounded, color: Colors.white, size: 18),
              label: const Text('Comprobar',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md))),
            ),
          ),
        )),
      ]);
    }
    return Row(children: [
      Container(width: 48, height: 48,
          decoration: BoxDecoration(
              border: Border.all(color: AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(AppRadius.md)),
          child: IconButton(
              icon: Icon(Icons.info_outline, color: Colors.grey[600], size: 22),
              onPressed: _mostrarInfo)),
      const SizedBox(width: 12),
      Expanded(child: SizedBox(height: 48,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [_kColor1, _kColor2],
                begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(AppRadius.md),
            boxShadow: AppShadow.colored(_kColor1),
          ),
          child: ElevatedButton.icon(
            onPressed: esUltima ? () => setState(() => _preguntaActual++) : _siguiente,
            icon: Icon(esUltima ? Icons.flag_outlined : Icons.arrow_forward_rounded,
                color: Colors.white, size: 18),
            label: Text(esUltima ? 'Finalizar' : 'Siguiente',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md))),
          ),
        ),
      )),
    ]);
  }
}