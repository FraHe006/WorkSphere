import 'package:flutter/material.dart';
import '../../app_theme.dart';

class GameHeader extends StatelessWidget {
  final String titulo;
  final Color color1, color2;
  final int actual, total;

  const GameHeader({Key? key, required this.titulo, required this.color1,
    required this.color2, required this.actual, required this.total}) : super(key: key);


  // Interfaz
  @override
  Widget build(BuildContext context) {
    final progreso = total == 0 ? 0.0 : actual / total;
    return Container(
      decoration: BoxDecoration(gradient: LinearGradient(
          colors: [color1, color2], begin: Alignment.topLeft, end: Alignment.bottomRight)),
      child: SafeArea(bottom: false, child: Stack(children: [
        Positioned(top: -30, right: -30, child: Container(
            width: 140, height: 140,
            decoration: BoxDecoration(shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.08)))),
        Positioned(bottom: -20, left: -20, child: Container(
            width: 90, height: 90,
            decoration: BoxDecoration(shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05)))),
        Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
            child: Row(children: [
              IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                  onPressed: () => Navigator.pop(context)),
              Expanded(child: Text(titulo, style: const TextStyle(color: Colors.white,
                  fontSize: 15, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppRadius.pill)),
                child: Text('$actual/$total', style: const TextStyle(color: Colors.white,
                    fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progreso,
                backgroundColor: Colors.white.withOpacity(0.25),
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                minHeight: 5,
              ),
            ),
          ),
        ]),
      ])),
    );
  }
}

// Diálogo de información adicional
class GameInfoDialog extends StatelessWidget {
  final Color color;
  final String texto;
  const GameInfoDialog({Key? key, required this.color, required this.texto}) : super(key: key);

  @override
  Widget build(BuildContext context) => AlertDialog(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
    titlePadding: EdgeInsets.zero,
    title: Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [color, color.withOpacity(0.7)],
            begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      child: const Row(children: [
        Icon(Icons.info_outline, color: Colors.white, size: 20),
        SizedBox(width: 8),
        Text('Información', style: TextStyle(color: Colors.white,
            fontSize: 16, fontWeight: FontWeight.w600)),
      ]),
    ),
    content: Text(texto, style: const TextStyle(fontSize: 15, height: 1.5,
        color: AppColors.textPrimary)),
    actions: [
      SizedBox(width: double.infinity, child: ElevatedButton(
        onPressed: () => Navigator.pop(context),
        style: ElevatedButton.styleFrom(backgroundColor: color,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
            elevation: 0),
        child: const Text('Cerrar', style: TextStyle(color: Colors.white,
            fontWeight: FontWeight.w600)),
      )),
    ],
    actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
  );
}

// Pantalla de error
class GameErrorScreen extends StatelessWidget {
  final Color color;
  final String titulo, error;
  final VoidCallback onReintentar;
  const GameErrorScreen({Key? key, required this.color, required this.titulo,
    required this.error, required this.onReintentar}) : super(key: key);

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.background,
    appBar: AppBar(title: Text(titulo), backgroundColor: color, foregroundColor: Colors.white),
    body: Center(child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.error_outline, size: 52, color: Colors.red[300]),
        const SizedBox(height: 12),
        Text(error, textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600], fontSize: 14)),
        const SizedBox(height: 20),
        GradientButton(label: 'Reintentar', icon: Icons.refresh, onPressed: onReintentar),
      ]),
    )),
  );
}

class FinItem {
  final String enunciado, subtitulo;
  final String? explicacion;
  const FinItem({required this.enunciado, required this.subtitulo, this.explicacion});
}

// Pantalla de fin
class GameFinScreen extends StatelessWidget {
  final String titulo;
  final Color color1, color2;
  final List<FinItem> items;
  final VoidCallback onVolver;
  const GameFinScreen({Key? key, required this.titulo, required this.color1,
    required this.color2, required this.items, required this.onVolver}) : super(key: key);

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.background,
    body: Column(children: [
      GameHeader(titulo: titulo, color1: color1, color2: color2,
          actual: items.length, total: items.length),
      // Banner trofeo
      Container(
        width: double.infinity,
        decoration: BoxDecoration(gradient: LinearGradient(
            colors: [color1, color2], begin: Alignment.topLeft, end: Alignment.bottomRight)),
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        child: Column(children: [
          const Icon(Icons.emoji_events, size: 56, color: Color(0xFFF9A825)),
          const SizedBox(height: 8),
          const Text('¡Has completado la actividad!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
        ]),
      ),
      Expanded(child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final it = items[i];
          return AppCard(padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${i+1}. ${it.enunciado}', style: const TextStyle(fontSize: 14,
                  fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text(it.subtitulo, style: TextStyle(fontSize: 13, color: color1,
                  fontWeight: FontWeight.w500)),
              if (it.explicacion?.isNotEmpty == true) ...[
                const SizedBox(height: 4),
                Text(it.explicacion!, style: TextStyle(fontSize: 12,
                    color: Colors.grey[600], fontStyle: FontStyle.italic)),
              ],
            ]),
          );
        },
      )),
      Padding(padding: const EdgeInsets.all(16),
          child: GradientButton(label: 'Volver', icon: Icons.home_outlined, onPressed: onVolver)),
      const SizedBox(height: 8),
    ]),
  );
}