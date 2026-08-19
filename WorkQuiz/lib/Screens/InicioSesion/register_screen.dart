// ─────────────────────────────────────────────────────────────────────────────
// register_screen.dart  —  REDISEÑADO
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../Services/InicioSesion/auth_service.dart';
import '../../Services/InicioSesion/api_service.dart';
import '../../app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double>  _fade;
  late Animation<Offset>  _slide;

  final _nameCtrl            = TextEditingController();
  final _emailCtrl           = TextEditingController();
  final _passwordCtrl        = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  bool _obscurePass    = true;
  bool _obscureConfirm = true;
  bool _acceptTerms    = false;
  bool _isLoading      = false;

  bool   _showVerification = false;
  String _generatedCode    = '';
  final  _codeCtrl         = TextEditingController();
  bool   _isVerifying      = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _fade  = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _slide = Tween<Offset>(begin: const Offset(0, 0.4), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _codeCtrl.dispose();
    super.dispose();
  }


  // Validar y enviar código por email
  void _handleRegister() async {
    if (!_validate()) return;
    setState(() => _isLoading = true);
    try {
      // Comprobar si el email ya existe
      final existe = await ApiService.existeEmail(_emailCtrl.text.trim());
      if (existe) {
        if (mounted) _showError('Ya existe una cuenta con este correo electrónico');
        return;
      }

      final codigo = (100000 + (DateTime.now().millisecondsSinceEpoch % 900000)).toString();

      final emailResp = await http.post(
        Uri.parse('http://dam2.colexio-karbo.com:6101/api/email/enviar'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'destinatario': _emailCtrl.text.trim(),
          'asunto': 'Código de verificación - Registro',
          'cuerpo': 'Hola ${_nameCtrl.text.trim()},\n\nTu código de verificación es: $codigo\n\nIntrodúcelo para completar el registro.',
        }),
      );
      final emailData = jsonDecode(emailResp.body) as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _generatedCode    = codigo;
          _showVerification = true;
        });
      }
      if (emailData['success'] != true) {
        if (mounted) _showError('Aviso: no se pudo enviar el correo. Usa el código de reenvío.');
      }
    } catch (e) {
      if (mounted) _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Verificar código y crear cuenta
  void _handleVerificarCodigo() async {
    if (_codeCtrl.text.trim() != _generatedCode) {
      _showError('Código incorrecto. Inténtalo de nuevo.');
      _codeCtrl.clear();
      return;
    }
    setState(() => _isVerifying = true);
    try {
      await AuthService.registrar(
          _nameCtrl.text.trim(), _emailCtrl.text.trim(), _passwordCtrl.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Row(children: [
            Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
            SizedBox(width: 8),
            Text('¡Cuenta creada exitosamente!'),
          ]),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  // Validar datos formulario
  bool _validate() {
    if (_nameCtrl.text.trim().length < 3) {
      _showError('El nombre debe tener al menos 3 caracteres'); return false;
    }
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_emailCtrl.text)) {
      _showError('Email no válido'); return false;
    }
    if (_passwordCtrl.text.length < 6) {
      _showError('Contraseña de al menos 6 caracteres'); return false;
    }
    if (_passwordCtrl.text != _confirmPasswordCtrl.text) {
      _showError('Las contraseñas no coinciden'); return false;
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

  // Widget

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          _buildHero(),
          Expanded(
            child: FadeTransition(
              opacity: _fade,
              child: SlideTransition(
                position: _slide,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                  child: Transform.translate(
                    offset: const Offset(0, -40),
                    child: _showVerification ? _buildVerificationCard() : _buildCard(),
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
      decoration: const BoxDecoration(gradient: AppColors.heroGradient),
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
              // Botón volver
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    border: Border.all(color: Colors.white.withOpacity(0.35)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 12),
                      SizedBox(width: 4),
                      Text('Volver',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                // Alternar entre verficar y crear cuenta
                _showVerification ? 'Verificación' : 'Crear Cuenta',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Únete a nuestra comunidad',
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
          const FieldLabel(Icons.person_outline, 'Nombre Completo'),
          const SizedBox(height: 8),
          TextField(
            controller: _nameCtrl,
            enabled: !_isLoading,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(
              hintText: 'Juan Pérez',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 18),

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
          const SizedBox(height: 18),

          const FieldLabel(Icons.lock_outlined, 'Contraseña'),
          const SizedBox(height: 8),
          TextField(
            controller: _passwordCtrl,
            enabled: !_isLoading,
            obscureText: _obscurePass,
            decoration: InputDecoration(
              hintText: '••••••••',
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePass ? Icons.visibility_off : Icons.visibility,
                  color: AppColors.textMuted, size: 20,
                ),
                onPressed: () => setState(() => _obscurePass = !_obscurePass),
              ),
            ),
          ),
          const SizedBox(height: 18),

          const FieldLabel(Icons.lock_outlined, 'Confirmar Contraseña'),
          const SizedBox(height: 8),
          TextField(
            controller: _confirmPasswordCtrl,
            enabled: !_isLoading,
            obscureText: _obscureConfirm,
            decoration: InputDecoration(
              hintText: '••••••••',
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                  color: AppColors.textMuted, size: 20,
                ),
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Crear cuenta
          GradientButton(
            label: 'Crear Cuenta',
            icon: Icons.person_add_outlined,
            onPressed: _handleRegister,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }

  // Tarjeta verificación
  Widget _buildVerificationCard() {
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
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Row(
              children: [
                const Icon(Icons.email_outlined, color: AppColors.primary, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Hemos enviado un código de 6 dígitos a ${_emailCtrl.text.trim()}',
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const FieldLabel(Icons.pin_outlined, 'Código de verificación'),
          const SizedBox(height: 8),
          TextField(
            controller: _codeCtrl,
            enabled: !_isVerifying,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 28, letterSpacing: 10, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(
              hintText: '000000',
              counterText: '',
            ),
          ),
          const SizedBox(height: 24),
          GradientButton(
            label: 'Verificar y crear cuenta',
            icon: Icons.check_circle_outline,
            onPressed: _handleVerificarCodigo,
            isLoading: _isVerifying,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              onPressed: _isVerifying ? null : _handleRegister,
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('Reenviar código'),
            ),
          ),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: _isVerifying
                  ? null
                  : () => setState(() {
                _showVerification = false;
                _generatedCode    = '';
                _codeCtrl.clear();
              }),
              child: const Text('Cancelar'),
            ),
          ),
        ],
      ),
    );
  }
}