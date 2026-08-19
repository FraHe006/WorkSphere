package org.example.Interfaz;

import java.awt.*;

public class Theme {

    private static boolean dark = true;

    public static boolean isDark() { return dark; }
    public static void    toggle() { dark = !dark; }

    // Fondos — niveles bien diferenciados
    public static Color bg()        { return dark ? c(15,15,15)   : c(238,238,238); }
    public static Color bgSide()    { return dark ? c(26,26,26)   : c(220,220,220); }
    public static Color bgCard()    { return dark ? c(38,38,38)   : c(255,255,255); }
    public static Color inputBg()   { return dark ? c(26,26,26)   : c(252,252,252); }

    // Bordes
    public static Color border()      { return dark ? c(62,62,62)  : c(198,198,198); }
    public static Color borderFocus() { return dark ? c(185,185,185): c(72,72,72);   }

    // Botón primario — blanco puro sobre oscuro / negro sobre claro
    public static Color btnPrimBg()    { return dark ? c(235,235,235): c(20,20,20);   }
    public static Color btnPrimHover() { return dark ? c(255,255,255): c(48,48,48);   }
    public static Color btnPrimFg()    { return dark ? c(15,15,15)  : c(238,238,238); }

    // Botón secundario — outline visible
    public static Color btnSecBorder() { return dark ? c(85,85,85)  : c(172,172,172); }
    public static Color btnSecFg()     { return dark ? c(195,195,195): c(68,68,68);   }
    public static Color btnSecHoverBg(){ return dark ? c(50,50,50)  : c(222,222,222); }
    public static Color btnSecHoverFg(){ return dark ? c(235,235,235): c(20,20,20);   }

    // Texto
    public static Color textPrimary()   { return dark ? c(235,235,235): c(20,20,20);   }
    public static Color textSecondary() { return dark ? c(118,118,118): c(125,125,125); }

    // Estado
    public static Color success() { return dark ? c(90,180,95)  : c(55,140,60);  }
    public static Color error()   { return dark ? c(200,75,75)  : c(175,55,55);  }

    // Fuentes
    public static final Font F_APP   = new Font("Segoe UI", Font.BOLD,  36);
    public static final Font F_TITLE = new Font("Segoe UI", Font.BOLD,  18);
    public static final Font F_CARD  = new Font("Segoe UI", Font.BOLD,  13);
    public static final Font F_BTN   = new Font("Segoe UI", Font.BOLD,  12);
    public static final Font F_BODY  = new Font("Segoe UI", Font.PLAIN, 13);
    public static final Font F_LABEL = new Font("Segoe UI", Font.PLAIN, 11);
    public static final Font F_SMALL = new Font("Segoe UI", Font.PLAIN, 11);

    // Constantes
    public static final int R  = 6;
    public static final int IH = 36;
    public static final int BH = 38;

    private static Color c(int r, int g, int b) { return new Color(r,g,b); }
}
