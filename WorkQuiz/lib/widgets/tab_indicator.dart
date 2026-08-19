import 'package:flutter/material.dart';

class TabIndicator extends Decoration {
  const TabIndicator();

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) {
    return _TabIndicatorPainter(
      onChanged: onChanged,
    );
  }
}

class _TabIndicatorPainter extends BoxPainter {
  _TabIndicatorPainter({
    required this.onChanged,
  });

  final VoidCallback? onChanged;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final paint = Paint()
      ..color = Colors.blue[600]!
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final width = configuration.size!.width;
    final height = configuration.size!.height;

    // Dibujar línea redondeada debajo del tab
    canvas.drawLine(
      Offset(offset.dx + 10, offset.dy + height - 5),
      Offset(offset.dx + width - 10, offset.dy + height - 5),
      paint,
    );
  }
}
