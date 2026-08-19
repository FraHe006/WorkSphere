package org.example.Login.Interfaz;

import org.example.Login.Logica.AutenticacionService;
import org.example.Interfaz.RoundedComponents.*;
import org.example.Interfaz.Theme;
import org.example.MenuScreen;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;

/**
 * Ventana de autenticación conectada al servidor Node.js (Puerto 6101).
 */
public class LoginScreen extends JFrame {
    private JPanel cardHolder;

    public LoginScreen() {
        super("Demo ");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        setSize((int)(sc.width * 0.80), (int)(sc.height * 0.80));
        setLocationRelativeTo(null);
        setShape(new RoundRectangle2D.Double(0,0,getWidth(),getHeight(),12,12));
        buildShell();
        showLoginView();
        addDragSupport();
    }

    // ── Estructura fija (barra + panel izquierdo + hueco derecho) ────────────
    private void buildShell() {
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

        JPanel cols = new JPanel(new BorderLayout());
        cols.setOpaque(false);
        cols.add(buildSidePanel(), BorderLayout.WEST);

        JSeparator vs = new JSeparator(SwingConstants.VERTICAL);
        vs.setForeground(Theme.border());
        vs.setPreferredSize(new Dimension(1, getHeight()));

        cardHolder = new JPanel(new GridBagLayout());
        cardHolder.setOpaque(false);

        JPanel rightWrap = new JPanel(new BorderLayout());
        rightWrap.setOpaque(false);
        rightWrap.add(vs,          BorderLayout.WEST);
        rightWrap.add(cardHolder,   BorderLayout.CENTER);

        cols.add(rightWrap, BorderLayout.CENTER);
        root.add(cols, BorderLayout.CENTER);
    }

    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(BorderFactory.createEmptyBorder(12,18,0,18));

        JLabel title = new JLabel("Demo ");
        title.setFont(new Font("Segoe UI ", Font.PLAIN, 12));
        title.setForeground(Theme.textSecondary());

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        right.setOpaque(false);

        JButton themeBtn = ghostBtn(Theme.isDark() ? "Modo claro " : "Modo oscuro ");
        themeBtn.addActionListener(e -> { Theme.toggle(); dispose(); new LoginScreen().setVisible(true); });

        JButton closeBtn = ghostBtn("x ");
        closeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { closeBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { closeBtn.setForeground(Theme.textSecondary()); }
        });
        closeBtn.addActionListener(e -> System.exit(0));

        right.add(themeBtn);
        right.add(closeBtn);
        bar.add(title, BorderLayout.WEST);
        bar.add(right, BorderLayout.EAST);

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(bar, BorderLayout.CENTER);
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(BorderFactory.createEmptyBorder(10,0,0,0));
        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        sepWrap.add(sep);
        wrap.add(sepWrap, BorderLayout.SOUTH);
        return wrap;
    }

    private JPanel buildSidePanel() {
        int leftW = (int)(getWidth() * 0.42);
        JPanel side = new JPanel(new GridBagLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bgSide());
                g2.fillRect(0,0,getWidth(),getHeight());
                g2.dispose();
            }
        };
        side.setOpaque(false);
        side.setPreferredSize(new Dimension(leftW, getHeight()));

        JPanel brand = new JPanel();
        brand.setLayout(new BoxLayout(brand, BoxLayout.Y_AXIS));
        brand.setOpaque(false);
        brand.setBorder(BorderFactory.createEmptyBorder(0,40,0,40));

        JLabel name = new JLabel("DEMO ");
        name.setFont(Theme.F_APP);
        name.setForeground(Theme.textPrimary());
        name.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel sub = new JLabel("Sistema de gestion ");
        sub.setFont(Theme.F_BODY);
        sub.setForeground(Theme.textSecondary());
        sub.setAlignmentX(Component.LEFT_ALIGNMENT);

        JSeparator div = new JSeparator();
        div.setForeground(Theme.border());
        div.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));
        div.setAlignmentX(Component.LEFT_ALIGNMENT);

        brand.add(name);
        brand.add(Box.createVerticalStrut(8));
        brand.add(sub);
        brand.add(Box.createVerticalStrut(30));
        brand.add(div);
        brand.add(Box.createVerticalStrut(22));

        for (String s : new String[]{"Gestion centralizada de datos ", "Control de acceso por roles ", "Reportes y seguimiento "}) {
            JLabel l = new JLabel(s);
            l.setFont(Theme.F_BODY);
            l.setForeground(Theme.textSecondary());
            l.setAlignmentX(Component.LEFT_ALIGNMENT);
            brand.add(l);
            brand.add(Box.createVerticalStrut(10));
        }
        side.add(brand);
        return side;
    }

    // ── Vista: LOGIN ──────────────────────────────────────────────────────
    private void showLoginView() {
        int w = getWidth(), h = getHeight();
        int leftW = (int)(w * 0.42);
        int cardW = Math.min((int)((w - leftW) * 0.70), 400);
        int cardH = Math.min((int)(h * 0.74), 500);

        JPanel card = card(cardW, cardH);

        // Campo para Email (requerido por el backend)
        RoundedField     emailF = new RoundedField( "correo@ejemplo.com ");
        RoundedPasswordField passF = new RoundedPasswordField( "1234 ");
        JLabel msg = msgLabel();

        emailF.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        passF.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        PrimaryButton   loginBtn = new PrimaryButton( "Iniciar sesion ");
        SecondaryButton regBtn   = new SecondaryButton( "Crear cuenta nueva ");
        loginBtn.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.BH));
        regBtn  .setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.BH));

        loginBtn.addActionListener(e -> {
            String email = emailF.getText().trim();
            String p = new String(passF.getPassword());

            if (email.isEmpty() || p.isEmpty()) {
                setMsg(msg, "Completa todos los campos. ", false);
                return;
            }

            loginBtn.setEnabled(false);
            setMsg(msg, "Conectando...", true);

            // Hilo separado para la petición HTTP
            new Thread(() -> {
                boolean isValid = AutenticacionService.login(email, p);

                SwingUtilities.invokeLater(() -> {
                    loginBtn.setEnabled(true);
                    if (isValid) {
                        setMsg(msg, "Acceso concedido. ", true);
                        new Timer(350, ev -> {
                            ((Timer)ev.getSource()).stop();
                            dispose();
                            new MenuScreen(email).setVisible(true);
                        }).start();
                    } else {
                        setMsg(msg, "Credenciales inválidas o error de servidor. ", false);
                        passF.setText("");
                        passF.requestFocus();
                    }
                });
            }).start();
        });

        emailF.addActionListener(e -> loginBtn.doClick());
        passF.addActionListener(e -> loginBtn.doClick());
        regBtn.addActionListener(e -> showRegisterView());

        card.add(heading("Iniciar sesion ", "Ingresa tus credenciales para continuar "));
        card.add(Box.createVerticalStrut(28));
        card.add(lbl("Email ")); card.add(Box.createVerticalStrut(6));
        card.add(emailF);
        card.add(Box.createVerticalStrut(14));
        card.add(lbl("Contrasena ")); card.add(Box.createVerticalStrut(6));
        card.add(passF);
        card.add(Box.createVerticalStrut(6));
        card.add(msg);
        card.add(Box.createVerticalStrut(14));
        card.add(loginBtn);
        card.add(Box.createVerticalStrut(8));
        card.add(regBtn);

        swapCard(card);
    }

    // ── Vista: REGISTRO ──────────────────────────────────────────────────────
    private void showRegisterView() {
        int w = getWidth(), h = getHeight();
        int leftW = (int)(w * 0.42);
        int cardW = Math.min((int)((w - leftW) * 0.70), 400);
        int cardH = Math.min((int)(h * 0.82), 560);

        JPanel card = card(cardW, cardH);

        // Campos para Registro (Nombre, Email, Password)
        RoundedField         nameF  = new RoundedField( "Nombre completo ");
        RoundedField         emailF = new RoundedField( "correo@ejemplo.com ");
        RoundedPasswordField passF  = new RoundedPasswordField( "Contrasena ");
        RoundedPasswordField pass2F = new RoundedPasswordField( "Confirmar contrasena ");
        JLabel msg = msgLabel();

        nameF.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        emailF.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        passF.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        pass2F.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        PrimaryButton   createBtn = new PrimaryButton( "Crear cuenta ");
        SecondaryButton backBtn   = new SecondaryButton( "Volver al inicio de sesion ");
        createBtn.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.BH));
        backBtn  .setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.BH));

        createBtn.addActionListener(e -> {
            String nombre = nameF.getText().trim();
            String email  = emailF.getText().trim();
            String p      = new String(passF.getPassword());
            String p2     = new String(pass2F.getPassword());

            if (nombre.isEmpty() || email.isEmpty() || p.isEmpty() || p2.isEmpty()) {
                setMsg(msg, "Completa todos los campos. ", false);
                return;
            }
            if (!p.equals(p2)) {
                setMsg(msg, "Las contrasenas no coinciden. ", false);
                return;
            }

            createBtn.setEnabled(false);
            setMsg(msg, "Registrando...", true);

            // Hilo separado para la petición HTTP
            new Thread(() -> {
                boolean success = AutenticacionService.register(nombre, email, p);

                SwingUtilities.invokeLater(() -> {
                    createBtn.setEnabled(true);
                    if (success) {
                        setMsg(msg, "Cuenta creada. Redirigiendo... ", true);
                        new Timer(1200, ev -> {
                            ((Timer)ev.getSource()).stop();
                            showLoginView();
                        }).start();
                    } else {
                        setMsg(msg, "Error al registrar (posible duplicado o servidor caído). ", false);
                    }
                });
            }).start();
        });

        nameF.addActionListener(ev -> createBtn.doClick());
        emailF.addActionListener(ev -> createBtn.doClick());
        passF.addActionListener(ev -> createBtn.doClick());
        pass2F.addActionListener(ev -> createBtn.doClick());
        backBtn.addActionListener(e  -> showLoginView());

        card.add(heading("Crear cuenta ", "Completa los datos para registrarte "));
        card.add(Box.createVerticalStrut(28));

        card.add(lbl("Nombre ")); card.add(Box.createVerticalStrut(6));
        card.add(nameF);

        card.add(Box.createVerticalStrut(14));
        card.add(lbl("Email ")); card.add(Box.createVerticalStrut(6));
        card.add(emailF);

        card.add(Box.createVerticalStrut(14));
        card.add(lbl("Contrasena ")); card.add(Box.createVerticalStrut(6));
        card.add(passF);

        card.add(Box.createVerticalStrut(14));
        card.add(lbl("Confirmar contrasena ")); card.add(Box.createVerticalStrut(6));
        card.add(pass2F);

        card.add(Box.createVerticalStrut(6));
        card.add(msg);
        card.add(Box.createVerticalStrut(14));
        card.add(createBtn);
        card.add(Box.createVerticalStrut(8));
        card.add(backBtn);

        swapCard(card);
    }

    // ── Intercambiar contenido del hueco derecho ──────────────────────────────
    private void swapCard(JPanel card) {
        cardHolder.removeAll();
        cardHolder.add(card);
        cardHolder.revalidate();
        cardHolder.repaint();
    }

    // ── Helpers de construcción  ──────────────────────────────────────────────
    private JPanel card(int w, int h) {
        JPanel c = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bgCard());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),8,8));
                g2.setStroke(new BasicStroke(1f));
                g2.setColor(Theme.border());
                g2.draw(new RoundRectangle2D.Float(0.5f,0.5f,getWidth()-1,getHeight()-1,8,8));
                g2.dispose();
            }
        };
        c.setOpaque(false);
        c.setLayout(new BoxLayout(c, BoxLayout.Y_AXIS));
        c.setBorder(BorderFactory.createEmptyBorder(34,34,34,34));
        c.setPreferredSize(new Dimension(w,h));
        c.setMaximumSize(new Dimension(w,h));
        return c;
    }

    private JPanel heading(String title, String sub) {
        JPanel p = new JPanel();
        p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
        p.setOpaque(false);
        p.setAlignmentX(Component.LEFT_ALIGNMENT);
        JLabel t = new JLabel(title);
        t.setFont(Theme.F_TITLE);
        t.setForeground(Theme.textPrimary());
        t.setAlignmentX(Component.LEFT_ALIGNMENT);
        JLabel s = new JLabel(sub);
        s.setFont(Theme.F_SMALL);
        s.setForeground(Theme.textSecondary());
        s.setAlignmentX(Component.LEFT_ALIGNMENT);
        p.add(t);
        p.add(Box.createVerticalStrut(5));
        p.add(s);
        return p;
    }

    private JLabel lbl(String text) {
        JLabel l =  new JLabel(text);
        l.setFont(Theme.F_LABEL);
        l.setForeground(Theme.textSecondary());
        l.setAlignmentX(Component.LEFT_ALIGNMENT);
        return l;
    }

    private JLabel msgLabel () {
        JLabel l = new JLabel("  ");
        l.setFont(Theme.F_SMALL);
        l.setForeground(Theme.error());
        l.setAlignmentX(Component.LEFT_ALIGNMENT);
        return l;
    }

    private void setMsg(JLabel l, String text, boolean ok) {
        l.setForeground(ok ? Theme.success() : Theme.error());
        l.setText(text);
    }

    private JButton ghostBtn(String text) {
        JButton b = new JButton(text);
        b.setFont(Theme.F_SMALL);
        b.setForeground(Theme.textSecondary());
        b.setContentAreaFilled(false); b.setBorderPainted(false); b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
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