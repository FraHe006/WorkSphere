// ─────────────────────────────────────────────────────────────────────────────
// login_screen.dart  —  REDISEÑADO
// Estética: gradiente azul→índigo hero, tarjeta blanca con sombra,
// campos redondeados, animación fade+slide igual que en los .js
// Para eliminar el banner de debug: añade debugShowCheckedModeBanner: false
// en MaterialApp (ver comentario al final).
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:proyectofinal1/screens/InicioSesion/register_screen.dart';
import '../../Services/InicioSesion/auth_service.dart';
import '../main_app_screen.dart';
import '../../app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double>  _fade;
  late Animation<Offset>  _slide;

  // Formulario login
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure   = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fade  = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _slide = Tween<Offset>(begin: const Offset(0, 0.4), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  // Función para login

  void _handleLogin() async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    try {
      await AuthService.login(_emailCtrl.text.trim(), _passwordCtrl.text);
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => MainAppScreen()),
        );
      }
    } catch (e) {
      if (mounted) _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Validar datos
  bool _validate() {
    if (_emailCtrl.text.isEmpty) {
      _showError('Por favor ingresa tu email'); return false;
    }
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_emailCtrl.text)) {
      _showError('Email no válido'); return false;
    }
    if (_passwordCtrl.text.length < 6) {
      _showError('Contraseña de al menos 6 caracteres'); return false;
    }
    return true;
  }

  // Mostrar error
  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [
        const Icon(Icons.error_outline, color: Colors.white, size: 18),
        const SizedBox(width: 8),
        Expanded(child: Text(msg)),
      ]),
      backgroundColor: AppColors.danger,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  // Interfaz

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          _buildHero(),

          // Formulario
          Expanded(
            child: FadeTransition(
              opacity: _fade,
              child: SlideTransition(
                position: _slide,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                  child: Transform.translate(
                    offset: const Offset(0, -40),
                    child: _buildCard(),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 70),
      decoration: const BoxDecoration(
        gradient: AppColors.heroGradient,
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -30, right: -30,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.07),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  border: Border.all(color: Colors.white.withOpacity(0.35)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.grid_view_rounded, color: Colors.white, size: 14),
                    SizedBox(width: 6),
                    Text('WorkQuiz',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Iniciar Sesión',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Bienvenido de vuelta',
                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 14),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCard() {
    return AppCard(
      padding: const EdgeInsets.all(28),
      borderRadius: AppRadius.xl,
      shadows: [
        BoxShadow(
          color: Colors.black.withOpacity(0.10),
          blurRadius: 28,
          offset: const Offset(0, 10),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FieldLabel(Icons.email_outlined, 'Email'),
          const SizedBox(height: 8),
          TextField(
            controller: _emailCtrl,
            enabled: !_isLoading,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              hintText: 'ejemplo@correo.com',
              prefixIcon: Icon(Icons.email_outlined),
            ),
          ),
          const SizedBox(height: 20),

          const FieldLabel(Icons.lock_outlined, 'Contraseña'),
          const SizedBox(height: 8),
          TextField(
            controller: _passwordCtrl,
            enabled: !_isLoading,
            obscureText: _obscure,
            onSubmitted: (_) => _handleLogin(),
            decoration: InputDecoration(
              hintText: '••••••••',
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscure ? Icons.visibility_off : Icons.visibility,
                  color: AppColors.textMuted,
                  size: 20,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
            ),
          ),
          const SizedBox(height: 8),

          GradientButton(
            label: 'Iniciar Sesión',
            icon: Icons.login_rounded,
            onPressed: _handleLogin,
            isLoading: _isLoading,
          ),
          const SizedBox(height: 24),

          Row(children: [
            const Expanded(child: Divider()),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('¿No tienes cuenta?',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500])),
            ),
            const Expanded(child: Divider()),
          ]),
          const SizedBox(height: 16),

          // Acceder a widget de registro
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _isLoading
                  ? null
                  : () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => RegisterScreen())),
              icon: const Icon(Icons.person_add_outlined, size: 18),
              label: const Text('Regístrate aquí'),
            ),
          ),
        ],
      ),
    );
  }
}