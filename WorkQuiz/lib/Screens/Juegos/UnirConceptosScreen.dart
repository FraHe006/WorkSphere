import 'package:flutter/material.dart';
import '../../Services/Juegos/game_service.dart';
import '../../app_theme.dart';
import 'game_widgets.dart';

const _kColor1 = Color(0xFF2E7D32);
const _kColor2 = Color(0xFF66BB6A);

class UnirConceptosScreen extends StatefulWidget {
  final String juegoCodigo;
  const UnirConceptosScreen({Key? key, required this.juegoCodigo}) : super(key: key);
  @override State<UnirConceptosScreen> createState() => _UnirConceptosScreenState();
}

class _UnirConceptosScreenState extends State<UnirConceptosScreen> {
  bool _loading = true; String? _error; JuegoUnirConceptos? _juego;
  List<UCPareja> _terminos = [], _definiciones = [];
  int? _terminoSel, _definicionSel;
  final Map<int,int> _emparejados = {};
  bool _finalizado = false;

  @override void initState() { super.initState(); _cargarJuego(); }

  // Cargar juego desde el service
  Future<void> _cargarJuego() async {
    try {
      final j = await JuegosService.getUnirConceptos(widget.juegoCodigo);
      final t = List<UCPareja>.from(j.parejas)..shuffle();
      final d = List<UCPareja>.from(j.parejas)..shuffle();
      if (mounted) setState(() { _juego=j; _terminos=t; _definiciones=d; _loading=false; });
    } catch (e) { if (mounted) setState(() { _error=e.toString(); _loading=false; }); }
  }

  // Definir término
  void _selTerm(int i) {
    if (_emparejados.containsKey(i)) return;
    setState(() { _terminoSel = _terminoSel == i ? null : i; });
    _intentar();
  }

  // Y definición
  void _selDef(int i) {
    if (_emparejados.values.contains(i)) return;
    setState(() { _definicionSel = _definicionSel == i ? null : i; });
    _intentar();
  }

  // Intentos
  void _intentar() {
    if (_terminoSel == null || _definicionSel == null) return;
    final ti = _terminoSel!, di = _definicionSel!;
    setState(() { _emparejados[ti]=di; _terminoSel=null; _definicionSel=null; });
    if (_emparejados.length == _terminos.length) {
      Future.delayed(const Duration(milliseconds: 300),
              () { if (mounted) setState(() => _finalizado=true); });
    }
  }

  // Designar como correcto
  bool _esCorrecto(int ti, int di) => _terminos[ti].id == _definiciones[di].id;

  // Mstrar info
  void _mostrarInfo() => showDialog(context: context, builder: (_) => GameInfoDialog(
    color: _kColor1,
    texto: _juego!.parejas.map((p) => '• ${p.termino} → ${p.definicion}').join('\n\n'),
  ));

  // Interfaz
  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return GameErrorScreen(
        color: _kColor1, titulo: 'Unir Conceptos', error: _error!,
        onReintentar: () { setState(() { _loading=true; _error=null; }); _cargarJuego(); });

    final j = _juego!;
    if (_finalizado) return _buildResultados(j);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        GameHeader(titulo: j.titulo, color1: _kColor1, color2: _kColor2,
            actual: _emparejados.length, total: _terminos.length),
        Expanded(child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              // Instrucción
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _kColor1.withOpacity(0.07),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: _kColor1.withOpacity(0.2)),
                ),
                child: Row(children: [
                  Icon(Icons.touch_app_outlined, color: _kColor1, size: 18),
                  const SizedBox(width: 8),
                  const Expanded(child: Text(
                      'Selecciona un término y después su definición',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary))),
                ]),
              ),
              const SizedBox(height: 16),
              // Columnas
              Expanded(child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: _buildColumna(esTermino: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildColumna(esTermino: false)),
                ],
              )),
              const SizedBox(height: 12),
              // Barra inferior
              Row(children: [
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
                      gradient: _emparejados.length == _terminos.length
                          ? const LinearGradient(colors: [_kColor1, _kColor2],
                          begin: Alignment.topLeft, end: Alignment.bottomRight)
                          : null,
                      color: _emparejados.length < _terminos.length ? AppColors.border : null,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: ElevatedButton.icon(
                      onPressed: _emparejados.length == _terminos.length
                          ? () => setState(() => _finalizado=true) : null,
                      icon: const Icon(Icons.flag_outlined, color: Colors.white, size: 18),
                      label: const Text('Ver resultado',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.md))),
                    ),
                  ),
                )),
              ]),
              const SizedBox(height: 8),
            ]),
          ),
        )),
      ]),
    );
  }

  // Crear las columnas de términos y definiciones
  Widget _buildColumna({required bool esTermino}) {
    final lista = esTermino ? _terminos : _definiciones;
    final titulo = esTermino ? 'Términos' : 'Definiciones';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [_kColor1, _kColor2],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(AppRadius.pill),
        ),
        child: Text(titulo, style: const TextStyle(color: Colors.white,
            fontSize: 11, fontWeight: FontWeight.w700)),
      ),
      const SizedBox(height: 8),
      ...List.generate(lista.length, (i) {
        final emparejado = esTermino
            ? _emparejados.containsKey(i)
            : _emparejados.values.contains(i);
        final seleccionado = esTermino ? _terminoSel == i : _definicionSel == i;
        return GestureDetector(
          onTap: () => esTermino ? _selTerm(i) : _selDef(i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: emparejado ? _kColor1.withOpacity(0.08)
                  : seleccionado ? _kColor1.withOpacity(0.15) : Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: emparejado || seleccionado ? _kColor1 : AppColors.border,
                width: seleccionado || emparejado ? 2 : 1.5,
              ),
              boxShadow: seleccionado ? AppShadow.colored(_kColor1) : AppShadow.card,
            ),
            child: Row(children: [
              if (emparejado) ...[
                const Icon(Icons.check_circle, color: _kColor1, size: 14),
                const SizedBox(width: 6),
              ],
              Expanded(child: Text(
                esTermino ? lista[i].termino : lista[i].definicion,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500,
                    color: emparejado || seleccionado ? _kColor1 : AppColors.textPrimary),
              )),
            ]),
          ),
        );
      }),
    ]);
  }

  // Mostrar resultados
  Widget _buildResultados(JuegoUnirConceptos j) {
    final resultados = _emparejados.entries.map((e) {
      final correcto = _esCorrecto(e.key, e.value);
      return (
      termino: _terminos[e.key].termino,
      definicion: _definiciones[e.value].definicion,
      defCorrecta: _terminos[e.key].definicion,
      correcto: correcto,
      explicacion: _terminos[e.key].explicacion,
      );
    }).toList();
    final ok = resultados.where((r) => r.correcto).length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        GameHeader(titulo: j.titulo, color1: _kColor1, color2: _kColor2,
            actual: ok, total: resultados.length),
        // Banner puntuación
        Container(
          width: double.infinity,
          decoration: const BoxDecoration(gradient: LinearGradient(
              colors: [_kColor1, _kColor2],
              begin: Alignment.topLeft, end: Alignment.bottomRight)),
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
          child: Column(children: [
            const Icon(Icons.emoji_events, size: 48, color: Color(0xFFF9A825)),
            const SizedBox(height: 6),
            Text('$ok / ${resultados.length} correctos',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold,
                    color: Colors.white)),
            Text(ok == resultados.length ? '¡Perfecto!'
                : ok > resultados.length ~/ 2 ? '¡Buen trabajo!' : 'Sigue practicando',
                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13)),
          ]),
        ),
        Expanded(child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: resultados.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, i) {
            final r = resultados[i];
            return AppCard(
              padding: const EdgeInsets.all(14),
              borderColor: r.correcto ? AppColors.success : AppColors.danger,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(r.correcto ? Icons.check_circle : Icons.cancel,
                      color: r.correcto ? AppColors.success : AppColors.danger, size: 18),
                  const SizedBox(width: 8),
                  Expanded(child: Text(r.termino,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13,
                          color: AppColors.textPrimary))),
                ]),
                const SizedBox(height: 6),
                Text('Tu respuesta: ${r.definicion}',
                    style: TextStyle(fontSize: 12,
                        color: r.correcto ? AppColors.success : AppColors.danger,
                        fontWeight: FontWeight.w500)),
                if (!r.correcto) ...[
                  const SizedBox(height: 2),
                  Text('Correcta: ${r.defCorrecta}',
                      style: const TextStyle(fontSize: 12, color: AppColors.success,
                          fontWeight: FontWeight.w500)),
                ],
                if (r.explicacion?.isNotEmpty == true) ...[
                  const SizedBox(height: 4),
                  Text(r.explicacion!, style: TextStyle(fontSize: 11,
                      color: Colors.grey[600], fontStyle: FontStyle.italic)),
                ],
              ]),
            );
          },
        )),
        Padding(padding: const EdgeInsets.all(16), child: Row(children: [
          Container(width: 48, height: 48,
              decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border, width: 1.5),
                  borderRadius: BorderRadius.circular(AppRadius.md)),
              child: IconButton(
                  icon: Icon(Icons.info_outline, color: Colors.grey[600], size: 22),
                  onPressed: _mostrarInfo)),
          const SizedBox(width: 12),
          Expanded(child: GradientButton(label: 'Volver', icon: Icons.home_outlined,
              onPressed: () => Navigator.pop(context))),
        ])),
        const SizedBox(height: 8),
      ]),
    );
  }
}