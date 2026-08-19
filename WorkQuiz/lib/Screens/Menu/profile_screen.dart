import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import '../../Services/InicioSesion/auth_service.dart';
import '../InicioSesion/login_screen.dart';
import '../../app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nombreCtrl            = TextEditingController();
  final _emailCtrl             = TextEditingController();
  final _passwordCtrl          = TextEditingController();
  final _confirmarPasswordCtrl = TextEditingController();
  final _imagenCtrl            = TextEditingController();
  final _descripcionCtrl       = TextEditingController();

  bool _editando        = false;
  bool _guardando       = false;
  bool _mostrarPassword = false;
  bool _cargandoImagen  = false;
  String _imagenPreview = '';
  String _errorImagen   = '';
  String _mensajeTexto  = '';
  bool   _mensajeExito  = false;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  // Cargar datos del usuario actualmente guardado en local
  void _cargarDatos() {
    final u = AuthService.usuarioActual;
    if (u == null) return;
    _nombreCtrl.text      = u.nombre;
    _emailCtrl.text       = u.email;
    _imagenCtrl.text      = u.imagenPerfil ?? '';
    _descripcionCtrl.text = u.descripcion ?? '';
    _imagenPreview        = u.imagenPerfil ?? '';
  }

  @override
  void dispose() {
    _nombreCtrl.dispose(); _emailCtrl.dispose();
    _passwordCtrl.dispose(); _confirmarPasswordCtrl.dispose();
    _imagenCtrl.dispose(); _descripcionCtrl.dispose();
    super.dispose();
  }

  // Validar datos de edición
  String? _validar() {
    if (_nombreCtrl.text.trim().isEmpty) return 'El nombre es obligatorio';
    if (_emailCtrl.text.trim().isEmpty)  return 'El email es obligatorio';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_emailCtrl.text.trim()))
      return 'El email no es válido';
    if (_passwordCtrl.text.isNotEmpty && _passwordCtrl.text.length < 6)
      return 'La contraseña debe tener al menos 6 caracteres';
    if (_passwordCtrl.text.isNotEmpty && _passwordCtrl.text != _confirmarPasswordCtrl.text)
      return 'Las contraseñas no coinciden';
    if (_errorImagen.isNotEmpty) return 'Hay un error con la imagen';
    return null;
  }

  // Guardar datos de edición
  Future<void> _guardar() async {
    final error = _validar();
    if (error != null) { _setMensaje(error, exito: false); return; }
    setState(() => _guardando = true);
    try {
      await AuthService.actualizarPerfil(
        nombre:       _nombreCtrl.text.trim(),
        email:        _emailCtrl.text.trim(),
        password:     _passwordCtrl.text.isNotEmpty ? _passwordCtrl.text : null,
        imagenPerfil: _imagenCtrl.text.trim().isNotEmpty ? _imagenCtrl.text.trim() : null,
        descripcion:  _descripcionCtrl.text.trim().isNotEmpty ? _descripcionCtrl.text.trim() : null,
      );
      _passwordCtrl.clear(); _confirmarPasswordCtrl.clear();
      setState(() => _editando = false);
      _setMensaje('Perfil actualizado exitosamente', exito: true);
      Future.delayed(const Duration(seconds: 3),
              () { if (mounted) setState(() => _mensajeTexto = ''); });
    } catch (_) {
      _setMensaje('Error al actualizar. Inténtalo de nuevo.', exito: false);
    } finally { setState(() => _guardando = false); }
  }

  // Cancelar edición
  void _cancelar() {
    _cargarDatos(); _passwordCtrl.clear(); _confirmarPasswordCtrl.clear();
    setState(() { _editando = false; _errorImagen = ''; _mensajeTexto = ''; });
  }

  // Cambiar imagen, decodificar
  void _onImagenChanged(String url) {
    final t = url.trim(), l = t.toLowerCase();
    if (t.isNotEmpty && (l.endsWith('.svg') || l.endsWith('.webp'))) {
      setState(() { _imagenPreview = ''; _cargandoImagen = false;
      _errorImagen = 'Formato no soportado. Usa JPG o PNG.'; });
      return;
    }
    setState(() {
      _errorImagen = ''; _mensajeTexto = '';
      if (t.isEmpty) { _imagenPreview = ''; _cargandoImagen = false; }
      else { _cargandoImagen = true; _imagenPreview = t; }
    });
  }

  void _setMensaje(String t, {required bool exito}) =>
      setState(() { _mensajeTexto = t; _mensajeExito = exito; });

  // Cierre de sesión
  void _handleLogout() {
    showDialog(context: context, builder: (_) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
      title: const Text('Cerrar Sesión'),
      content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        TextButton(
          onPressed: () { Navigator.pop(context); AuthService.logout();
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const LoginScreen())); },
          child: const Text('Cerrar sesión', style: TextStyle(color: AppColors.danger)),
        ),
      ],
    ));
  }

  // Interfz
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                if (_mensajeTexto.isNotEmpty) ...[_buildMensajeBanner(), const SizedBox(height: 16)],
                _buildProfileCard(),
                const SizedBox(height: 16),
                _buildLogoutButton(),
                const SizedBox(height: 40),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final u = AuthService.usuarioActual;
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(gradient: AppColors.heroGradient),
      child: SafeArea(
        bottom: false,
        child: Stack(children: [
          // Burbujas decorativas (igual que general/topic)
          Positioned(top: -40, right: -40, child: Container(
              width: 180, height: 180,
              decoration: BoxDecoration(shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.07)))),
          Positioned(bottom: -25, left: -25, child: Container(
              width: 120, height: 120,
              decoration: BoxDecoration(shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.05)))),
          Positioned(top: 30, right: 120, child: Container(
              width: 50, height: 50,
              decoration: BoxDecoration(shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.06)))),
          // Contenido
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(children: [
              Row(children: [
                _buildAvatar(),
                const SizedBox(width: 16),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u?.nombre ?? 'Usuario',
                        style: const TextStyle(color: Colors.white, fontSize: 18,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(u?.email ?? '',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                  ],
                )),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }

  // Avatar del usuario
  Widget _buildAvatar() {
    return Container(
      width: 64, height: 64,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2.5),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0,4))],
      ),
      child: ClipOval(child: _imagenPreview.isNotEmpty
          ? _SafeNetworkImage(url: _imagenPreview, fallback: _avatarFallback(),
          onLoad: () {}, onError: () {})
          : _avatarFallback()),
    );
  }

  // Perfil del usuario
  Widget _buildProfileCard() {
    return AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Cabecera azul
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: const BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
          ),
          child: const Row(children: [
            Icon(Icons.person_outline, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Text('Datos del perfil',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
          ]),
        ),

        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (_editando) ...[
              Center(child: Stack(alignment: Alignment.center, children: [
                Container(
                  width: 90, height: 90,
                  decoration: BoxDecoration(shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 3),
                      boxShadow: AppShadow.blue),
                  child: ClipOval(child: _imagenPreview.isNotEmpty
                      ? _SafeNetworkImage(url: _imagenPreview, fallback: _avatarFallback(size: 90),
                      onLoad: () { if (mounted) setState(() => _cargandoImagen = false); },
                      onError: () { if (mounted) setState(() {
                        _cargandoImagen = false;
                        _errorImagen = 'No se pudo cargar la imagen.'; }); })
                      : _avatarFallback(size: 90)),
                ),
                if (_cargandoImagen) const CircularProgressIndicator(strokeWidth: 2),
              ])),
              const SizedBox(height: 14),
              const FieldLabel(Icons.link, 'URL de imagen de perfil'),
              const SizedBox(height: 6),
              TextField(controller: _imagenCtrl, onChanged: _onImagenChanged,
                  decoration: InputDecoration(hintText: 'https://...',
                      prefixIcon: const Icon(Icons.image_outlined),
                      errorText: _errorImagen.isNotEmpty ? _errorImagen : null)),
              const SizedBox(height: 20),
              const Divider(),
              const SizedBox(height: 16),
            ],

            const FieldLabel(Icons.person_outline, 'Nombre'),
            const SizedBox(height: 8),
            _field(_nombreCtrl, 'Tu nombre', Icons.person_outline),
            const SizedBox(height: 16),

            const FieldLabel(Icons.email_outlined, 'Email'),
            const SizedBox(height: 8),
            _field(_emailCtrl, 'tu@email.com', Icons.email_outlined,
                keyboard: TextInputType.emailAddress),
            const SizedBox(height: 16),

            const FieldLabel(Icons.notes_outlined, 'Descripción'),
            const SizedBox(height: 8),
            _field(_descripcionCtrl, 'Escribe algo sobre ti...', Icons.notes_outlined, maxLines: 3),

            if (_editando) ...[
              const SizedBox(height: 16),
              const FieldLabel(Icons.lock_outline, 'Nueva Contraseña'),
              Text('Déjala vacía si no quieres cambiarla.',
                  style: TextStyle(fontSize: 11, color: Colors.grey[500])),
              const SizedBox(height: 8),
              TextFormField(controller: _passwordCtrl, obscureText: !_mostrarPassword,
                  decoration: InputDecoration(hintText: 'Mínimo 6 caracteres',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_mostrarPassword ? Icons.visibility_off : Icons.visibility,
                            color: AppColors.textMuted, size: 20),
                        onPressed: () => setState(() => _mostrarPassword = !_mostrarPassword),
                      ))),
              const SizedBox(height: 16),
              const FieldLabel(Icons.lock_outline, 'Confirmar Contraseña'),
              const SizedBox(height: 8),
              _field(_confirmarPasswordCtrl, 'Repite la contraseña', Icons.lock_outline,
                  obscure: !_mostrarPassword),
            ],

            const SizedBox(height: 24),

            if (!_editando)
              GradientButton(
                label: 'Editar Perfil',
                icon: Icons.edit_outlined,
                onPressed: () => setState(() => _editando = true),
              )
            else
              Row(children: [
                Expanded(child: SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: _guardando ? null : _cancelar,
                    icon: const Icon(Icons.cancel_outlined, size: 16),
                    label: const Text('Cancelar',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textPrimary,
                      side: const BorderSide(color: AppColors.border, width: 1.5),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md)),
                    ),
                  ),
                )),
                const SizedBox(width: 12),
                Expanded(child: SizedBox(
                  height: 48,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: (_guardando || _cargandoImagen)
                          ? null : AppColors.heroGradient,
                      color: (_guardando || _cargandoImagen) ? AppColors.border : null,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: ElevatedButton.icon(
                      onPressed: (_guardando || _cargandoImagen) ? null : _guardar,
                      icon: _guardando
                          ? const SizedBox(width: 15, height: 15,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.check_circle_outline, size: 16, color: Colors.white),
                      label: Text(_guardando ? 'Guardando...' : 'Guardar',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md)),
                      ),
                    ),
                  ),
                )),
              ]),
          ]),
        ),
      ]),
    );
  }

  // Cierre de sesión
  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity, height: 52,
      child: ElevatedButton.icon(
        onPressed: _handleLogout,
        icon: const Icon(Icons.logout, size: 18, color: Colors.white),
        label: const Text('Cerrar Sesión',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.danger,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _buildMensajeBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _mensajeExito ? AppColors.success.withOpacity(0.08) : AppColors.danger.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: _mensajeExito ? AppColors.success : AppColors.danger),
      ),
      child: Row(children: [
        Icon(_mensajeExito ? Icons.check_circle_outline : Icons.error_outline,
            color: _mensajeExito ? AppColors.success : AppColors.danger, size: 18),
        const SizedBox(width: 10),
        Expanded(child: Text(_mensajeTexto,
            style: TextStyle(color: _mensajeExito ? const Color(0xFF0A3622) : const Color(0xFF58151C),
                fontSize: 13))),
        IconButton(icon: const Icon(Icons.close, size: 16),
            onPressed: () => setState(() => _mensajeTexto = ''),
            color: AppColors.textMuted, padding: EdgeInsets.zero,
            constraints: const BoxConstraints()),
      ]),
    );
  }

  Widget _avatarFallback({double size = 64}) {
    final i = AuthService.usuarioActual?.nombre.isNotEmpty == true
        ? AuthService.usuarioActual!.nombre[0].toUpperCase() : 'U';
    return Container(width: size, height: size, color: AppColors.primary,
        child: Center(child: Text(i,
            style: TextStyle(fontSize: size * 0.42, color: Colors.white, fontWeight: FontWeight.bold))));
  }

  Widget _field(TextEditingController ctrl, String hint, IconData icon,
      {TextInputType keyboard = TextInputType.text, bool obscure = false, int maxLines = 1}) {
    return TextField(
      controller: ctrl, enabled: _editando, keyboardType: keyboard,
      obscureText: obscure, maxLines: obscure ? 1 : maxLines,
      onChanged: (_) => setState(() => _mensajeTexto = ''),
      decoration: InputDecoration(hintText: hint, prefixIcon: Icon(icon),
          disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: BorderSide(color: Colors.grey[200]!, width: 1.5)),
          filled: true,
          fillColor: _editando ? const Color(0xFFF8F9FA) : const Color(0xFFF1F3F5)),
    );
  }
}

// Imagen cargada desde internet
class _SafeNetworkImage extends StatefulWidget {
  final String url; final Widget fallback;
  final VoidCallback onLoad, onError;
  const _SafeNetworkImage({required this.url, required this.fallback, required this.onLoad, required this.onError});
  @override State<_SafeNetworkImage> createState() => _SafeNetworkImageState();
}
class _SafeNetworkImageState extends State<_SafeNetworkImage> {
  Uint8List? _bytes; bool _error = false;
  @override void initState() { super.initState(); _fetch(widget.url); }
  @override void didUpdateWidget(_SafeNetworkImage old) {
    super.didUpdateWidget(old);
    if (old.url != widget.url) { setState(() { _bytes = null; _error = false; }); _fetch(widget.url); }
  }
  Future<void> _fetch(String url) async {
    try {
      final r = await http.get(Uri.parse(url));
      if (r.statusCode == 200 && mounted) { setState(() => _bytes = r.bodyBytes); widget.onLoad(); }
      else throw Exception();
    } catch (_) { if (mounted) { setState(() => _error = true); widget.onError(); } }
  }
  @override Widget build(BuildContext context) {
    if (_error) return widget.fallback;
    if (_bytes == null) return const Center(child: CircularProgressIndicator(strokeWidth: 2));
    return Image.memory(_bytes!, fit: BoxFit.cover);
  }
}