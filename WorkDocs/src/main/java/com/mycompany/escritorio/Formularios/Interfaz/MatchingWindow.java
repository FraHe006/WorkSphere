package org.example.Formularios.Interfaz;

import org.example.Interfaz.RoundedComponents.*;
import org.example.Interfaz.Theme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;
import java.util.ArrayList;
import java.util.List;

/**
 * Formulario para crear juegos de Unir Conceptos.
 * Cada pareja tiene: término izquierdo, definición derecha
 * y una explicación adicional.
 */
public class MatchingWindow extends JFrame {

    private static class Pair {
        RoundedField term;        // concepto / término
        RoundedField definition;  // definición / par
        RoundedField explanation; // explicación extra
        JPanel       panel;
    }

    private final List<Pair> pairs = new ArrayList<>();
    private JPanel           pairsPanel;
    private JScrollPane      scroll;
    private int              pairCount = 0;
    private RoundedField     gameTitleField;

    public MatchingWindow(JFrame parent) {
        super("Demo — Unir Conceptos");
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        int w = (int)(sc.width  * 0.72);
        int h = (int)(sc.height * 0.82);
        setSize(w, h);
        setLocationRelativeTo(parent);
        setShape(new RoundRectangle2D.Double(0,0,w,h,12,12));
        buildUI();
        addPair();
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
        root.add(buildTopBar(),    BorderLayout.NORTH);
        root.add(buildCenter(),    BorderLayout.CENTER);
        root.add(buildBottomBar(), BorderLayout.SOUTH);
    }

    // ── Barra superior ───────────────────────────────────────────────────────
    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(12,18,0,18));

        JLabel title = new JLabel("Demo  /  Unir Conceptos");
        title.setFont(Theme.F_LABEL);
        title.setForeground(Theme.textSecondary());

        JButton closeBtn = ghostBtn("x");
        closeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { closeBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { closeBtn.setForeground(Theme.textSecondary()); }
        });
        closeBtn.addActionListener(e -> dispose());

        bar.add(title,    BorderLayout.WEST);
        bar.add(closeBtn, BorderLayout.EAST);
        return wrapWithSep(bar);
    }

    // ── Centro ───────────────────────────────────────────────────────────────
    private JPanel buildCenter() {
        JPanel outer = new JPanel(new BorderLayout());
        outer.setOpaque(false);
        outer.setBorder(new EmptyBorder(20,28,10,28));

        // Título del juego
        JPanel titleRow = new JPanel(new BorderLayout(0,6));
        titleRow.setOpaque(false);
        titleRow.setBorder(new EmptyBorder(0,0,18,0));

        JLabel tLbl = new JLabel("Titulo del juego");
        tLbl.setFont(Theme.F_TITLE);
        tLbl.setForeground(Theme.textPrimary());

        gameTitleField = new RoundedField("Escribe el titulo del juego...");
        gameTitleField.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        titleRow.add(tLbl,           BorderLayout.NORTH);
        titleRow.add(gameTitleField, BorderLayout.CENTER);

        // Cabecera de columnas
        JPanel colHeader = new JPanel(new GridLayout(1,3,12,0));
        colHeader.setOpaque(false);
        colHeader.setBorder(new EmptyBorder(0,0,8,0));
        colHeader.add(colLabel("Termino / Concepto"));
        colHeader.add(colLabel("Definicion / Par"));
        colHeader.add(colLabel("Explicacion adicional"));

        JPanel topSection = new JPanel(new BorderLayout());
        topSection.setOpaque(false);
        topSection.add(titleRow,  BorderLayout.NORTH);
        topSection.add(colHeader, BorderLayout.SOUTH);

        // Lista de parejas
        pairsPanel = new JPanel();
        pairsPanel.setLayout(new BoxLayout(pairsPanel, BoxLayout.Y_AXIS));
        pairsPanel.setOpaque(false);

        scroll = new JScrollPane(pairsPanel);
        scroll.setOpaque(false);
        scroll.getViewport().setOpaque(false);
        scroll.setBorder(null);
        scroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        scroll.getVerticalScrollBar().setUnitIncrement(14);
        styleScrollBar(scroll);

        outer.add(topSection, BorderLayout.NORTH);
        outer.add(scroll,     BorderLayout.CENTER);
        return outer;
    }

    // ── Barra inferior ───────────────────────────────────────────────────────
    private JPanel buildBottomBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(0,18,4,18));

        SecondaryButton templateBtn = new SecondaryButton("Abrir plantilla");
        SecondaryButton addBtn      = new SecondaryButton("+ Agregar pareja");
        PrimaryButton   saveBtn     = new PrimaryButton("Guardar juego");
        templateBtn.setPreferredSize(new Dimension(140, Theme.BH));
        addBtn     .setPreferredSize(new Dimension(150, Theme.BH));
        saveBtn    .setPreferredSize(new Dimension(140, Theme.BH));

        templateBtn.addActionListener(e -> new TemplateEditor(this, TemplateEditor.GameType.MATCHING).setVisible(true));
        addBtn .addActionListener(e -> addPair());
        saveBtn.addActionListener(e -> saveGame());

        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        JPanel sw = new JPanel(new BorderLayout());
        sw.setOpaque(false);
        sw.setBorder(new EmptyBorder(0,18,0,18));
        sw.add(sep);

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(sw,  BorderLayout.NORTH);
        wrap.add(bar, BorderLayout.CENTER);

        bar.add(templateBtn);
        bar.add(addBtn);
        bar.add(saveBtn);
        return wrap;
    }

    // ── Añadir pareja ────────────────────────────────────────────────────────
    private void addPair() {
        pairCount++;
        Pair p = new Pair();

        JPanel row = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bgCard());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),8,8));
                g2.setStroke(new BasicStroke(1f));
                g2.setColor(Theme.border());
                g2.draw(new RoundRectangle2D.Float(0.5f,0.5f,getWidth()-1,getHeight()-1,8,8));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        row.setLayout(new BorderLayout(0,0));
        row.setOpaque(false);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 118));

        // Número de pareja + botón eliminar
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(10,14,4,14));

        JLabel numLbl = new JLabel("Pareja " + pairCount);
        numLbl.setFont(Theme.F_CARD);
        numLbl.setForeground(Theme.textPrimary());

        JButton delBtn = ghostBtn("Eliminar");
        delBtn.setFont(Theme.F_SMALL);
        delBtn.setForeground(Theme.textSecondary());
        delBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { delBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { delBtn.setForeground(Theme.textSecondary()); }
        });
        delBtn.addActionListener(e -> removePair(p));

        header.add(numLbl,  BorderLayout.WEST);
        header.add(delBtn,  BorderLayout.EAST);

        // Tres columnas de campos
        JPanel fields = new JPanel(new GridLayout(1,3,12,0));
        fields.setOpaque(false);
        fields.setBorder(new EmptyBorder(4,14,14,14));

        p.term        = new RoundedField("Concepto o termino...");
        p.definition  = new RoundedField("Definicion o par...");
        p.explanation = new RoundedField("Explicacion adicional...");

        p.term       .setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        p.definition .setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        p.explanation.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        fields.add(p.term);
        fields.add(p.definition);
        fields.add(p.explanation);

        row.add(header, BorderLayout.NORTH);
        row.add(fields, BorderLayout.CENTER);

        p.panel = row;
        pairs.add(p);

        pairsPanel.add(row);
        pairsPanel.add(Box.createVerticalStrut(10));
        pairsPanel.revalidate();
        pairsPanel.repaint();

        SwingUtilities.invokeLater(() -> {
            JScrollBar vsb = scroll.getVerticalScrollBar();
            vsb.setValue(vsb.getMaximum());
        });
    }

    private void removePair(Pair p) {
        pairs.remove(p);
        Component[] comps = pairsPanel.getComponents();
        for (int i = 0; i < comps.length; i++) {
            if (comps[i] == p.panel) {
                pairsPanel.remove(i);
                if (i < pairsPanel.getComponentCount()) pairsPanel.remove(i);
                break;
            }
        }
        renumberPairs();
        pairsPanel.revalidate();
        pairsPanel.repaint();
    }

    private void renumberPairs() {
        pairCount = 0;
        for (Pair p : pairs) {
            pairCount++;
            JPanel header = (JPanel) p.panel.getComponent(0);
            ((JLabel) ((BorderLayout) header.getLayout()).getLayoutComponent(BorderLayout.WEST))
                .setText("Pareja " + pairCount);
        }
    }

    private void saveGame() {
        String title = gameTitleField.getText().trim();
        if (title.isEmpty()) {
            showMsg("El titulo del juego no puede estar vacio.", false); return;
        }
        if (pairs.isEmpty()) {
            showMsg("Agrega al menos una pareja.", false); return;
        }
        for (int i = 0; i < pairs.size(); i++) {
            Pair p = pairs.get(i);
            if (p.term.getText().trim().isEmpty() || p.definition.getText().trim().isEmpty()) {
                showMsg("La pareja " + (i+1) + " esta incompleta.", false); return;
            }
        }
        showMsg("Juego \"" + title + "\" guardado con " + pairs.size() + " pareja(s).", true);
    }

    private void showMsg(String text, boolean ok) {
        JOptionPane.showMessageDialog(this, text,
            ok ? "Guardado" : "Aviso", JOptionPane.PLAIN_MESSAGE);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private JLabel colLabel(String text) {
        JLabel l = new JLabel(text);
        l.setFont(Theme.F_LABEL);
        l.setForeground(Theme.textSecondary());
        return l;
    }

    private JPanel wrapWithSep(JPanel content) {
        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        JPanel sw = new JPanel(new BorderLayout());
        sw.setOpaque(false);
        sw.setBorder(new EmptyBorder(10,0,0,0));
        sw.add(sep);
        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(content, BorderLayout.CENTER);
        wrap.add(sw,      BorderLayout.SOUTH);
        return wrap;
    }

    private JButton ghostBtn(String text) {
        JButton b = new JButton(text);
        b.setFont(Theme.F_SMALL);
        b.setForeground(Theme.textSecondary());
        b.setContentAreaFilled(false); b.setBorderPainted(false); b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private void styleScrollBar(JScrollPane sp) {
        sp.getVerticalScrollBar().setPreferredSize(new Dimension(6,0));
        sp.getVerticalScrollBar().setUI(new javax.swing.plaf.basic.BasicScrollBarUI() {
            @Override protected void configureScrollBarColors() {
                thumbColor = Theme.border();
                trackColor = Theme.bg();
            }
            @Override protected JButton createDecreaseButton(int o) { return zeroBtn(); }
            @Override protected JButton createIncreaseButton(int o) { return zeroBtn(); }
            private JButton zeroBtn() {
                JButton b = new JButton(); b.setPreferredSize(new Dimension(0,0)); return b;
            }
        });
    }

    private static Graphics2D aa(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
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
