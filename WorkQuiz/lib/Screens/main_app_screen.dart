import 'package:flutter/material.dart';
import 'Menu/general_screen.dart';
import 'Menu/sandbox_screen.dart';
import 'Menu/profile_screen.dart';
import '../widgets/custom_bottom_nav_bar.dart';
import '../app_theme.dart';

class MainAppScreen extends StatefulWidget {
  MainAppScreen({Key? key}) : super(key: key);

  @override
  State<MainAppScreen> createState() => _MainAppScreenState();
}

class _MainAppScreenState extends State<MainAppScreen> {
  int _currentIndex = 0;

  // Cargar las diferentes pantallas
  late final List<Widget> _screens = [
    const GeneralScreen(),
    const SandboxScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: KeyedSubtree(
          key: ValueKey(_currentIndex),
          child: _screens[_currentIndex],
        ),
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}