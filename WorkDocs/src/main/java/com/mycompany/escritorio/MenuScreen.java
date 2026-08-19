package org.example;

import org.example.Formularios.Interfaz.ConversationWindow;
import org.example.Formularios.Interfaz.FillBlankWindow;
import org.example.Formularios.Interfaz.MatchingWindow;
import org.example.Formularios.Interfaz.TrueFalseWindow;
import org.example.Interfaz.ModuleWindow;
import org.example.Interfaz.Theme;
import org.example.Login.Interfaz.LoginScreen;
import org.example.Interfaz.RoundedComponents.*;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;

public class MenuScreen extends JFrame {

    private final String username;

    private static final String[][] CARDS = {
        {"Verdadero y Falso",  "Crea preguntas con\nrespuesta verdadera o falsa\ny explicacion extra."},
        {"Unir Conceptos",     "Crea parejas de terminos\ny definiciones con\nexplicacion adicional."},
        {"Rellenar Frases",    "Crea frases con huecos\nque el jugador debe\ncompletar correctamente."},
        {"Conversacion",       "Crea dialogos con opciones\nmultiples, puntuadores\ny desenlaces por rango."},
    };

    public MenuScreen(String username) {
        super("Demo — Menu");
        this.username = username;
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        setSize((int)(sc.width*0.80), (int)(sc.height*0.80));
        setLocationRelativeTo(null);
        setShape(new RoundRectangle2D.Double(0,0,getWidth(),getHeight(),12,12));
        buildUI();
        addDragSupport();
    }

    private void buildUI() {
        JPanel root = new JPanel(new BorderLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bg());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),12,12));
                g2.dispose();
            }
        };
        root.setOpaque(false);
        setContentPane(root);
        root.add(buildTopBar(), BorderLayout.NORTH);
        root.add(buildBody(),   BorderLayout.CENTER);
    }

    // ── Barra superior ───────────────────────────────────────────────────────
    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(BorderFactory.createEmptyBorder(12,18,0,18));

        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        left.setOpaque(false);
        JLabel app  = styledLbl("Demo",          Theme.textPrimary(),   new Font("Segoe UI", Font.BOLD, 12));
        JLabel sep1 = styledLbl("  /  ",          Theme.textSecondary(), Theme.F_SMALL);
        JLabel page = styledLbl("Menu principal", Theme.textSecondary(), Theme.F_SMALL);
        left.add(app); left.add(sep1); left.add(page);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        right.setOpaque(false);

        JLabel userLbl = styledLbl("Hola, " + username, Theme.textSecondary(), Theme.F_SMALL);

        JButton themeBtn = ghostBtn(Theme.isDark() ? "Modo claro" : "Modo oscuro");
        themeBtn.addActionListener(e -> { Theme.toggle(); dispose(); new MenuScreen(username).setVisible(true); });

        JButton logoutBtn = ghostBtn("Cerrar sesion");
        logoutBtn.addMouseListener(hoverEffect(logoutBtn));
        logoutBtn.addActionListener(e -> { dispose(); new LoginScreen().setVisible(true); });

        JButton closeBtn = ghostBtn("x");
        closeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { closeBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { closeBtn.setForeground(Theme.textSecondary()); }
        });
        closeBtn.addActionListener(e -> System.exit(0));

        right.add(userLbl); right.add(themeBtn); right.add(logoutBtn); right.add(closeBtn);
        bar.add(left, BorderLayout.WEST);
        bar.add(right, BorderLayout.EAST);

        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        JPanel sw = new JPanel(new BorderLayout());
        sw.setOpaque(false);
        sw.setBorder(BorderFactory.createEmptyBorder(10,0,0,0));
        sw.add(sep);

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(bar, BorderLayout.CENTER);
        wrap.add(sw,  BorderLayout.SOUTH);
        return wrap;
    }

    // ── Cuerpo ───────────────────────────────────────────────────────────────
    private JPanel buildBody() {
        JPanel body = new JPanel(new BorderLayout());
        body.setOpaque(false);

        JPanel header = new JPanel();
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));
        header.setOpaque(false);
        header.setBorder(BorderFactory.createEmptyBorder(30,46,18,46));

        JLabel greet = new JLabel("Bienvenido, " + username);
        greet.setFont(new Font("Segoe UI", Font.BOLD, 20));
        greet.setForeground(Theme.textPrimary());
        greet.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel sub = new JLabel("Selecciona un modulo para abrirlo.");
        sub.setFont(Theme.F_BODY);
        sub.setForeground(Theme.textSecondary());
        sub.setAlignmentX(Component.LEFT_ALIGNMENT);

        header.add(greet);
        header.add(Box.createVerticalStrut(5));
        header.add(sub);

        JPanel grid = new JPanel(new GridLayout(2, 2, 18, 18));
        grid.setOpaque(false);
        grid.setBorder(BorderFactory.createEmptyBorder(4, 46, 46, 46));

        for (String[] data : CARDS) {
            grid.add(buildCard(data[0], data[1]));
        }

        body.add(header, BorderLayout.NORTH);
        body.add(grid,   BorderLayout.CENTER);
        return body;
    }

    // ── Tarjeta ──────────────────────────────────────────────────────────────
    private JPanel buildCard(String title, String description) {
        final boolean[] hov = {false};

        JPanel card = new JPanel(new BorderLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                // Fondo diferenciado en hover
                g2.setColor(hov[0] ? Theme.bgSide() : Theme.bgCard());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),8,8));
                // Borde más visible en hover
                g2.setStroke(new BasicStroke(hov[0] ? 1.6f : 1f));
                g2.setColor(hov[0] ? Theme.borderFocus() : Theme.border());
                g2.draw(new RoundRectangle2D.Float(0.6f,0.6f,getWidth()-1.2f,getHeight()-1.2f,8,8));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        card.setOpaque(false);
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        card.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { hov[0]=true;  card.repaint(); }
            public void mouseExited (MouseEvent e) { hov[0]=false; card.repaint(); }
            public void mouseClicked(MouseEvent e) { openModule(title); }
        });

        JPanel inner = new JPanel();
        inner.setLayout(new BoxLayout(inner, BoxLayout.Y_AXIS));
        inner.setOpaque(false);
        inner.setBorder(BorderFactory.createEmptyBorder(22,22,22,22));

        JLabel titleLbl = new JLabel(title);
        titleLbl.setFont(Theme.F_CARD);
        titleLbl.setForeground(Theme.textPrimary());
        titleLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        sep.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));
        sep.setAlignmentX(Component.LEFT_ALIGNMENT);

        inner.add(titleLbl);
        inner.add(Box.createVerticalStrut(10));
        inner.add(sep);
        inner.add(Box.createVerticalStrut(12));

        for (String line : description.split("\n")) {
            JLabel l = new JLabel(line);
            l.setFont(Theme.F_BODY);
            l.setForeground(Theme.textSecondary());
            l.setAlignmentX(Component.LEFT_ALIGNMENT);
            inner.add(l);
            inner.add(Box.createVerticalStrut(2));
        }

        inner.add(Box.createVerticalGlue());
        inner.add(Box.createVerticalStrut(16));

        // Botón "Abrir" — PrimaryButton pequeño, tamaño fijo
        PrimaryButton btn = new PrimaryButton("Abrir");
        btn.setAlignmentX(Component.LEFT_ALIGNMENT);
        btn.setMaximumSize(new Dimension(88, Theme.BH));
        btn.setPreferredSize(new Dimension(88, Theme.BH));
        btn.addActionListener(e -> openModule(title));
        // Para que el hover del botón no quite el hover de la tarjeta
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { hov[0]=true;  card.repaint(); }
            public void mouseExited (MouseEvent e) { hov[0]=false; card.repaint(); }
        });

        inner.add(btn);
        card.add(inner, BorderLayout.CENTER);
        return card;
    }

    private void openModule(String title) {
        switch (title) {
            case "Verdadero y Falso":
                new TrueFalseWindow(this).setVisible(true);
                break;
            case "Unir Conceptos":
                new MatchingWindow(this).setVisible(true);
                break;
            case "Rellenar Frases":
                new FillBlankWindow(this).setVisible(true);
                break;
            case "Conversacion":
                new ConversationWindow(this).setVisible(true);
                break;
            default:
                new ModuleWindow(title, this).setVisible(true);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private JLabel styledLbl(String text, Color color, Font font) {
        JLabel l = new JLabel(text);
        l.setFont(font);
        l.setForeground(color);
        return l;
    }

    private JButton ghostBtn(String text) {
        JButton b = new JButton(text);
        b.setFont(Theme.F_SMALL);
        b.setForeground(Theme.textSecondary());
        b.setContentAreaFilled(false); b.setBorderPainted(false); b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private MouseAdapter hoverEffect(JButton btn) {
        return new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setForeground(Theme.textPrimary()); }
            public void mouseExited (MouseEvent e) { btn.setForeground(Theme.textSecondary()); }
        };
    }

    private static Graphics2D aa(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        return g2;
    }

    private void addDragSupport() {
        final Point[] s = {null};
        addMouseListener(new MouseAdapter() {
            public void mousePressed(MouseEvent e) { s[0] = e.getPoint(); }
        });
        addMouseMotionListener(new MouseMotionAdapter() {
            public void mouseDragged(MouseEvent e) {
                if (s[0]==null) return;
                Point loc = getLocation();
                setLocation(loc.x+e.getX()-s[0].x, loc.y+e.getY()-s[0].y);
            }
        });
    }
}
