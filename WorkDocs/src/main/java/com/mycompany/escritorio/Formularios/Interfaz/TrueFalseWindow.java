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
 * Formulario para crear juegos de Verdadero / Falso.
 * Permite añadir N preguntas, cada una con enunciado,
 * respuesta correcta (V/F) y una explicación extra.
 */
public class TrueFalseWindow extends JFrame {

    // Modelo de una pregunta
    private static class Question {
        RoundedField     statement;   // enunciado
        JToggleButton    trueBtn;
        JToggleButton    falseBtn;
        ButtonGroup      group;
        RoundedField     explanation; // explicación extra
        JPanel           panel;
    }

    private final List<Question> questions = new ArrayList<>();
    private JPanel               questionsPanel;
    private JScrollPane          scroll;
    private int                  questionCount = 0;

    // Campo de título del juego
    private RoundedField gameTitleField;

    public TrueFalseWindow(JFrame parent) {
        super("Demo — Verdadero / Falso");
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        int w = (int)(sc.width  * 0.70);
        int h = (int)(sc.height * 0.80);
        setSize(w, h);
        setLocationRelativeTo(parent);
        setShape(new RoundRectangle2D.Double(0,0,w,h,12,12));
        buildUI();
        addQuestion(); // una pregunta vacía inicial
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

        JLabel title = new JLabel("Demo  /  Verdadero y Falso");
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

        JPanel wrap = wrapWithSep(bar);
        return wrap;
    }

    // ── Centro: título del juego + lista de preguntas ────────────────────────
    private JPanel buildCenter() {
        JPanel outer = new JPanel(new BorderLayout());
        outer.setOpaque(false);
        outer.setBorder(new EmptyBorder(20,28,10,28));

        // Título del juego
        JPanel titleRow = new JPanel(new BorderLayout(0,6));
        titleRow.setOpaque(false);
        titleRow.setBorder(new EmptyBorder(0,0,18,0));

        JLabel gameTitleLbl = new JLabel("Titulo del juego");
        gameTitleLbl.setFont(Theme.F_TITLE);
        gameTitleLbl.setForeground(Theme.textPrimary());

        gameTitleField = new RoundedField("Escribe el titulo del juego...");
        gameTitleField.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        titleRow.add(gameTitleLbl,  BorderLayout.NORTH);
        titleRow.add(gameTitleField, BorderLayout.CENTER);

        // Panel de preguntas (crece dinámicamente)
        questionsPanel = new JPanel();
        questionsPanel.setLayout(new BoxLayout(questionsPanel, BoxLayout.Y_AXIS));
        questionsPanel.setOpaque(false);

        scroll = new JScrollPane(questionsPanel);
        scroll.setOpaque(false);
        scroll.getViewport().setOpaque(false);
        scroll.setBorder(null);
        scroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        scroll.getVerticalScrollBar().setUnitIncrement(14);
        styleScrollBar(scroll);

        outer.add(titleRow, BorderLayout.NORTH);
        outer.add(scroll,   BorderLayout.CENTER);
        return outer;
    }

    // ── Barra inferior: añadir pregunta + guardar ────────────────────────────
    private JPanel buildBottomBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(0,18,4,18));

        // Separador
        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());

        SecondaryButton templateBtn = new SecondaryButton("Abrir plantilla");
        SecondaryButton addBtn      = new SecondaryButton("+ Agregar pregunta");
        PrimaryButton   saveBtn     = new PrimaryButton("Guardar juego");
        templateBtn.setPreferredSize(new Dimension(140, Theme.BH));
        addBtn     .setPreferredSize(new Dimension(160, Theme.BH));
        saveBtn    .setPreferredSize(new Dimension(140, Theme.BH));

        templateBtn.addActionListener(e -> new TemplateEditor(this, TemplateEditor.GameType.TRUE_FALSE).setVisible(true));
        addBtn .addActionListener(e -> addQuestion());
        saveBtn.addActionListener(e -> saveGame());

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(new EmptyBorder(0,18,0,18));
        sepWrap.add(sep);
        wrap.add(sepWrap, BorderLayout.NORTH);
        wrap.add(bar,     BorderLayout.CENTER);

        bar.add(templateBtn);
        bar.add(addBtn);
        bar.add(saveBtn);
        return wrap;
    }

    // ── Añadir una pregunta al panel ─────────────────────────────────────────
    private void addQuestion() {
        questionCount++;
        Question q = new Question();

        // Contenedor de la pregunta
        JPanel qPanel = new JPanel() {
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
        qPanel.setLayout(new BoxLayout(qPanel, BoxLayout.Y_AXIS));
        qPanel.setOpaque(false);
        qPanel.setBorder(new EmptyBorder(16,18,16,18));
        qPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        qPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 240));

        // Cabecera: número + botón eliminar
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setAlignmentX(Component.LEFT_ALIGNMENT);
        header.setMaximumSize(new Dimension(Integer.MAX_VALUE, 26));

        JLabel numLbl = new JLabel("Pregunta " + questionCount);
        numLbl.setFont(Theme.F_CARD);
        numLbl.setForeground(Theme.textPrimary());

        JButton delBtn = ghostBtn("Eliminar");
        delBtn.setFont(Theme.F_SMALL);
        delBtn.setForeground(Theme.textSecondary());
        delBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { delBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { delBtn.setForeground(Theme.textSecondary()); }
        });
        delBtn.addActionListener(e -> removeQuestion(q));

        header.add(numLbl,  BorderLayout.WEST);
        header.add(delBtn,  BorderLayout.EAST);

        // Enunciado
        q.statement = new RoundedField("Escribe el enunciado de la pregunta...");
        q.statement.setAlignmentX(Component.LEFT_ALIGNMENT);
        q.statement.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        // Botones V / F
        JPanel vfRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        vfRow.setOpaque(false);
        vfRow.setAlignmentX(Component.LEFT_ALIGNMENT);

        q.trueBtn  = vfToggle("Verdadero");
        q.falseBtn = vfToggle("Falso");
        q.group = new ButtonGroup();
        q.group.add(q.trueBtn);
        q.group.add(q.falseBtn);
        q.trueBtn.setSelected(true); // predeterminado: Verdadero

        vfRow.add(q.trueBtn);
        vfRow.add(Box.createHorizontalStrut(10));
        vfRow.add(q.falseBtn);

        // Explicación extra
        JLabel expLbl = new JLabel("Explicacion adicional");
        expLbl.setFont(Theme.F_LABEL);
        expLbl.setForeground(Theme.textSecondary());
        expLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        q.explanation = new RoundedField("Añade una explicacion o pista para el jugador...");
        q.explanation.setAlignmentX(Component.LEFT_ALIGNMENT);
        q.explanation.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        qPanel.add(header);
        qPanel.add(Box.createVerticalStrut(10));
        qPanel.add(q.statement);
        qPanel.add(Box.createVerticalStrut(10));
        qPanel.add(vfRow);
        qPanel.add(Box.createVerticalStrut(10));
        qPanel.add(expLbl);
        qPanel.add(Box.createVerticalStrut(5));
        qPanel.add(q.explanation);

        q.panel = qPanel;
        questions.add(q);

        questionsPanel.add(qPanel);
        questionsPanel.add(Box.createVerticalStrut(12));
        questionsPanel.revalidate();
        questionsPanel.repaint();

        // Bajar scroll al fondo
        SwingUtilities.invokeLater(() -> {
            JScrollBar vsb = scroll.getVerticalScrollBar();
            vsb.setValue(vsb.getMaximum());
        });
    }

    private void removeQuestion(Question q) {
        questions.remove(q);
        // Eliminar el panel y el strut debajo
        Component[] comps = questionsPanel.getComponents();
        for (int i = 0; i < comps.length; i++) {
            if (comps[i] == q.panel) {
                questionsPanel.remove(i);
                if (i < questionsPanel.getComponentCount()) {
                    questionsPanel.remove(i); // strut
                }
                break;
            }
        }
        renumberQuestions();
        questionsPanel.revalidate();
        questionsPanel.repaint();
    }

    private void renumberQuestions() {
        questionCount = 0;
        for (Question q : questions) {
            questionCount++;
            // El primer child del panel es el header, su west es el JLabel
            JPanel header = (JPanel) q.panel.getComponent(0);
            ((JLabel) ((BorderLayout) header.getLayout()).getLayoutComponent(BorderLayout.WEST))
                .setText("Pregunta " + questionCount);
        }
    }

    private void saveGame() {
        String title = gameTitleField.getText().trim();
        if (title.isEmpty()) {
            showMsg("El titulo del juego no puede estar vacio.", false);
            return;
        }
        if (questions.isEmpty()) {
            showMsg("Agrega al menos una pregunta.", false);
            return;
        }
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            if (q.statement.getText().trim().isEmpty()) {
                showMsg("La pregunta " + (i+1) + " no tiene enunciado.", false);
                return;
            }
        }
        showMsg("Juego \"" + title + "\" guardado con " + questions.size() + " pregunta(s).", true);
    }

    private void showMsg(String text, boolean ok) {
        JOptionPane pane = new JOptionPane(text, JOptionPane.PLAIN_MESSAGE);
        JDialog dlg = pane.createDialog(this, ok ? "Guardado" : "Aviso");
        dlg.setVisible(true);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private JToggleButton vfToggle(String text) {
        JToggleButton btn = new JToggleButton(text) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                boolean sel = isSelected();
                g2.setColor(sel ? Theme.btnPrimBg() : Theme.bgCard());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),Theme.R,Theme.R));
                g2.setStroke(new BasicStroke(1.2f));
                g2.setColor(sel ? Theme.btnPrimBg() : Theme.btnSecBorder());
                g2.draw(new RoundRectangle2D.Float(0.6f,0.6f,getWidth()-1.2f,getHeight()-1.2f,Theme.R,Theme.R));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        btn.setForeground(Theme.textSecondary());
        btn.setFont(Theme.F_BTN);
        btn.setOpaque(false);
        btn.setContentAreaFilled(false);
        btn.setBorderPainted(false);
        btn.setFocusPainted(false);
        btn.setPreferredSize(new Dimension(100, Theme.BH));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.addChangeListener(e -> {
            btn.setForeground(btn.isSelected() ? Theme.btnPrimFg() : Theme.textSecondary());
            btn.repaint();
        });
        return btn;
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
                thumbColor      = Theme.border();
                trackColor      = Theme.bg();
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
