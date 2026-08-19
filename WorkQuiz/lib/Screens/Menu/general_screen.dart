import 'dart:async';
import 'package:flutter/material.dart';
import '../../Services/Juegos/game_service.dart';
import '../topic_detail_screen.dart';
import '../../app_theme.dart';

const List<List<Color>> _kPalette = [
  [Color(0xFF1976D2), Color(0xFF64B5F6)],
  [Color(0xFF388E3C), Color(0xFF81C784)],
  [Color(0xFF7B1FA2), Color(0xFFBA68C8)],
  [Color(0xFFF57C00), Color(0xFFFFB74D)],
  [Color(0xFFC62828), Color(0xFFEF9A9A)],
  [Color(0xFF00695C), Color(0xFF4DB6AC)],
];

class GeneralScreen extends StatefulWidget {
  const GeneralScreen({Key? key}) : super(key: key);
  @override State<GeneralScreen> createState() => _GeneralScreenState();
}

class _GeneralScreenState extends State<GeneralScreen> {
  late PageController _pageController;
  int _currentIndex = 0;
  late DateTime _now;
  Timer? _timer;
  List<Categoria> _categorias = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.85);
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(minutes: 1),
            (_) { if (mounted) setState(() => _now = DateTime.now()); });
    _loadCategorias();
  }

  // Cargar categorías para el carrusel interactivo
  Future<void> _loadCategorias() async {
    try {
      final cats = await JuegosService.getCategorias();
      if (mounted) setState(() { _categorias = cats; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  // Obtener fecha de hoy
  String _getFecha() {
    const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
      'agosto','septiembre','octubre','noviembre','diciembre'];
    return '${dias[_now.weekday % 7]}, ${_now.day} de ${meses[_now.month - 1]}';
  }

  // Interfaz
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(slivers: [

        SliverAppBar(
          expandedHeight: 170,
          pinned: true,
          backgroundColor: AppColors.primary,
          flexibleSpace: FlexibleSpaceBar(
            // Sin title para evitar el solapado
            collapseMode: CollapseMode.pin,
            background: Container(
              decoration: const BoxDecoration(gradient: AppColors.heroGradient),
              child: Stack(children: [
                // Círculos decorativos
                Positioned(top: -40, right: -40, child: Container(
                    width: 200, height: 200,
                    decoration: BoxDecoration(shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.07)))),
                Positioned(bottom: -30, left: -30, child: Container(
                    width: 140, height: 140,
                    decoration: BoxDecoration(shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.05)))),
                // Contenido del header: título + fecha
                Positioned(left: 20, right: 20, bottom: 18,
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('WorkQuiz', style: TextStyle(color: Colors.white,
                          fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.3)),
                      const SizedBox(height: 8),
                      _buildDateBadge(),
                    ])),
              ]),
            ),
          ),
        ),

        // Categorías
        SliverToBoxAdapter(child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
          child: Row(children: [
            const Text('Categorías', style: TextStyle(fontSize: 18,
                fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const Spacer(),
            if (!_loading && _categorias.isNotEmpty)
              AppBadge('${_categorias.length}'),
          ]),
        )),

        SliverToBoxAdapter(child: _buildCarousel()),
        const SliverToBoxAdapter(child: SizedBox(height: 30)),
      ]),
    );
  }

  // Fecha de hoy
  Widget _buildDateBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: Colors.white.withOpacity(0.25)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.today_outlined, color: Colors.white, size: 16),
        const SizedBox(width: 8),
        Text(_getFecha(), style: const TextStyle(color: Colors.white,
            fontSize: 13, fontWeight: FontWeight.w500)),
      ]),
    );
  }

  // Construir el carrusel con las categorías
  Widget _buildCarousel() {
    if (_loading) return const SizedBox(height: 260,
        child: Center(child: CircularProgressIndicator()));

    if (_error != null) return SizedBox(height: 260, child: Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.error_outline, size: 40, color: Colors.red[300]),
        const SizedBox(height: 8),
        Text('No se pudieron cargar las categorías',
            style: TextStyle(color: Colors.grey[600])),
        const SizedBox(height: 8),
        OutlinedButton(
            onPressed: () { setState(() { _loading=true; _error=null; }); _loadCategorias(); },
            child: const Text('Reintentar')),
      ]),
    ));

    if (_categorias.isEmpty) return SizedBox(height: 260, child: Center(
        child: Text('No hay categorías disponibles',
            style: TextStyle(color: Colors.grey[600]))));

    return Column(children: [
      SizedBox(
        height: 260,
        child: PageView.builder(
          controller: _pageController,
          onPageChanged: (i) => setState(() => _currentIndex = i),
          itemCount: _categorias.length,
          itemBuilder: (context, i) {
            final cat     = _categorias[i];
            final palette = _kPalette[i % _kPalette.length];
            final active  = _currentIndex == i;
            return AnimatedScale(
              scale: active ? 1.0 : 0.88,
              duration: const Duration(milliseconds: 280),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                child: _buildCard(cat, palette[0], palette[1]),
              ),
            );
          },
        ),
      ),
      const SizedBox(height: 14),
      // Indicadores
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_categorias.length, (i) {
          final active = _currentIndex == i;
          return AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: active ? 28 : 7, height: 7,
            decoration: BoxDecoration(
              color: active ? AppColors.primary : Colors.grey[300],
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
          );
        }),
      ),
      const SizedBox(height: 12),
      AppBadge('${_currentIndex + 1} / ${_categorias.length}',
          color: AppColors.primary),
    ]);
  }

  // Tarjetas de cada categoría, al pulsar una redirigir al widget con las actividades
  Widget _buildCard(Categoria cat, Color c1, Color c2) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(
          builder: (_) => TopicDetailScreen(
              categoria: cat, color1: c1, color2: c2))),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [c1, c2],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(AppRadius.xl),
          boxShadow: AppShadow.colored(c1),
        ),
        padding: const EdgeInsets.all(22),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Icono
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
            child: Text('Categoría', style: TextStyle(
                color: Colors.white.withOpacity(0.9), fontSize: 10,
                fontWeight: FontWeight.w700, letterSpacing: 0.8)),
          ),
          const SizedBox(height: 8),
          Text(cat.nombre, style: const TextStyle(fontSize: 18,
              fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 6),
          Text('Explora los juegos de esta categoría',
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.85),
                  height: 1.4)),
        ]),
      ),
    );
  }
}