import 'package:flutter/material.dart';
import '../../Services/Juegos/game_service.dart';
import '../../app_theme.dart';
import 'game_widgets.dart';

const _kColor1 = Color(0xFF1565C0);
const _kColor2 = Color(0xFF42A5F5);

class VerdaderoFalsoScreen extends StatefulWidget {
  final String juegoCodigo;
  const VerdaderoFalsoScreen({Key? key, required this.juegoCodigo}) : super(key: key);
  @override State<VerdaderoFalsoScreen> createState() => _VerdaderoFalsoScreenState();
}

class _VerdaderoFalsoScreenState extends State<VerdaderoFalsoScreen> {
  bool _loading = true;
  String? _error;
  JuegoVerdaderoFalso? _juego;
  int _preguntaActual = 0;
  bool? _respuestaUsuario;
  bool? _esCorrecta;

  @override
  void initState() { super.initState(); _cargarJuego(); }

  // Cargar juego desde el service
  Future<void> _cargarJuego() async {
    try {
      final j = await JuegosService.getVerdaderoFalso(widget.juegoCodigo);
      if (mounted) setState(() { _juego = j; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  // Función para responder a la pregunta
  void _responder(bool r) {
    if (_respuestaUsuario != null) return;
    setState(() {
      _respuestaUsuario = r;
      _esCorrecta = _juego!.preguntas[_preguntaActual].respuesta == r;
    });
  }

  // Avanzar a la siguiente pregunta
  void _siguiente() => setState(() {
    _preguntaActual++; _respuestaUsuario = null; _esCorrecta = null;
  });

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
        color: _kColor1, titulo: 'Verdadero o Falso', error: _error!,
        onReintentar: () { setState(() { _loading = true; _error = null; }); _cargarJuego(); });

    final juego = _juego!;
    if (_preguntaActual >= juego.preguntas.length) return GameFinScreen(
      titulo: juego.titulo, color1: _kColor1, color2: _kColor2,
      items: juego.preguntas.map((p) => FinItem(
        enunciado: p.enunciado,
        subtitulo: 'Respuesta: ${p.respuesta ? "Verdadero" : "Falso"}',
        explicacion: p.explicacion,
      )).toList(),
      onVolver: () => Navigator.pop(context),
    );

    final p = juego.preguntas[_preguntaActual];
    final respondida = _respuestaUsuario != null;
    final esUltima = _preguntaActual == juego.preguntas.length - 1;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        GameHeader(titulo: juego.titulo, color1: _kColor1, color2: _kColor2,
            actual: _preguntaActual, total: juego.preguntas.length),
        Expanded(child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Column(children: [
              Text('Pregunta ${_preguntaActual + 1} de ${juego.preguntas.length}',
                  style: TextStyle(fontSize: 13, color: Colors.grey[600],
                      fontWeight: FontWeight.w500)),
              const SizedBox(height: 16),
              AppCard(
                padding: const EdgeInsets.all(24),
                child: Text(p.enunciado, textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600,
                        height: 1.5, color: AppColors.textPrimary)),
              ),
              const SizedBox(height: 24),
              if (respondida) _buildFeedback(),
              const Spacer(),
              if (!respondida) _buildBotonesVF(),
              if (respondida) ...[_buildBarraInferior(esUltima), const SizedBox(height: 8)],
              const SizedBox(height: 16),
            ]),
          ),
        )),
      ]),
    );
  }

  // Feedback sobre si la pregunta es correcta o incorrecta
  Widget _buildFeedback() {
    final ok = _esCorrecta!;
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
            color: ok ? AppColors.success : AppColors.danger, size: 26),
        const SizedBox(width: 12),
        Expanded(child: Text(
          ok ? '¡Enhorabuena! Respuesta correcta.'
              : 'Incorrecto. La respuesta es ${_juego!.preguntas[_preguntaActual].respuesta ? "Verdadero" : "Falso"}.',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
              color: ok ? AppColors.success : AppColors.danger),
        )),
      ]),
    );
  }

  // Botones de verdadero falso, cada uno referencia a la función de responder
  Widget _buildBotonesVF() {
    return Row(children: [
      Expanded(child: _BotonVF(label: 'Verdadero', icon: Icons.check_circle_outline,
          color1: const Color(0xFF2E7D32), color2: const Color(0xFF66BB6A),
          onTap: () => _responder(true))),
      const SizedBox(width: 14),
      Expanded(child: _BotonVF(label: 'Falso', icon: Icons.cancel_outlined,
          color1: const Color(0xFFC62828), color2: const Color(0xFFEF9A9A),
          onTap: () => _responder(false))),
    ]);
  }

  Widget _buildBarraInferior(bool esUltima) {
    return Row(children: [
      Container(
        width: 48, height: 48,
        decoration: BoxDecoration(border: Border.all(color: AppColors.border, width: 1.5),
            borderRadius: BorderRadius.circular(AppRadius.md)),
        child: IconButton(
          icon: Icon(Icons.info_outline, color: Colors.grey[600], size: 22),
          onPressed: _mostrarInfo,
        ),
      ),
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

class _BotonVF extends StatelessWidget {
  final String label; final IconData icon;
  final Color color1, color2; final VoidCallback onTap;
  const _BotonVF({required this.label, required this.icon,
    required this.color1, required this.color2, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [color1, color2],
            begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadow.colored(color1),
      ),
      child: Column(children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 16,
            fontWeight: FontWeight.bold)),
      ]),
    ),
  );
}