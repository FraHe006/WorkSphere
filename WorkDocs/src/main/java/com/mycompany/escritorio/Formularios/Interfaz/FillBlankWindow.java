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
 * Formulario para crear juegos de Rellenar Frases.
 * Cada pregunta tiene:
 *   - Frase con el hueco marcado con [___]
 *   - Respuesta correcta
 *   - Explicación adicional
 */
public class FillBlankWindow extends JFrame {

    private static class Question {
        RoundedField sentence;      // frase con [___]
        RoundedField answer;        // respuesta correcta
        RoundedField explanation;   // explicación extra
        JPanel       panel;
    }

    private final List<Question> questions = new ArrayList<>();
    private JPanel               questionsPanel;
    private JScrollPane          scroll;
    private int                  questionCount = 0;
    private RoundedField         gameTitleField;

    public FillBlankWindow(JFrame parent) {
        super("Demo — Rellenar Frases");
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
        addQuestion();
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

    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(12,18,0,18));

        JLabel title = new JLabel("Demo  /  Rellenar Frases");
        title.setFont(Theme.F_LABEL);
        title.setForeground(Theme.textSecondary());

        JButton closeBtn = ghostBtn("x");
        closeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { closeBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { closeBtn.setForeground(Theme.textSecondary()); }
        });
        closeBtn.addActionListener(e -> dispose());
        bar.add(title, BorderLayout.WEST);
        bar.add(closeBtn, BorderLayout.EAST);
        return wrapWithSep(bar);
    }

    private JPanel buildCenter() {
        JPanel outer = new JPanel(new BorderLayout());
        outer.setOpaque(false);
        outer.setBorder(new EmptyBorder(20,28,10,28));

        // Título del juego
        JPanel titleRow = new JPanel(new BorderLayout(0,6));
        titleRow.setOpaque(false);
        titleRow.setBorder(new EmptyBorder(0,0,6,0));

        JLabel tLbl = new JLabel("Titulo del juego");
        tLbl.setFont(Theme.F_TITLE);
        tLbl.setForeground(Theme.textPrimary());

        gameTitleField = new RoundedField("Escribe el titulo del juego...");
        gameTitleField.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        // Ayuda de formato
        JLabel hint = new JLabel("Usa [___] para marcar el hueco en la frase. Ejemplo:  \"El cielo es de color [___].\"");
        hint.setFont(Theme.F_SMALL);
        hint.setForeground(Theme.textSecondary());

        titleRow.add(tLbl,           BorderLayout.NORTH);
        titleRow.add(gameTitleField, BorderLayout.CENTER);

        JPanel topSection = new JPanel(new BorderLayout(0,8));
        topSection.setOpaque(false);
        topSection.setBorder(new EmptyBorder(0,0,14,0));
        topSection.add(titleRow, BorderLayout.NORTH);
        topSection.add(hint,     BorderLayout.SOUTH);

        // Panel de preguntas
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

        outer.add(topSection, BorderLayout.NORTH);
        outer.add(scroll,     BorderLayout.CENTER);
        return outer;
    }

    private JPanel buildBottomBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        bar.setOpaque(false);

        SecondaryButton templateBtn = new SecondaryButton("Abrir plantilla");
        SecondaryButton addBtn      = new SecondaryButton("+ Agregar pregunta");
        PrimaryButton   saveBtn     = new PrimaryButton("Guardar juego");
        templateBtn.setPreferredSize(new Dimension(140, Theme.BH));
        addBtn     .setPreferredSize(new Dimension(162, Theme.BH));
        saveBtn    .setPreferredSize(new Dimension(140, Theme.BH));
        templateBtn.addActionListener(e -> new TemplateEditor(this, TemplateEditor.GameType.FILL_BLANK).setVisible(true));
        addBtn .addActionListener(e -> addQuestion());
        saveBtn.addActionListener(e -> saveGame());
        bar.add(templateBtn);
        bar.add(addBtn);
        bar.add(saveBtn);

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
        return wrap;
    }

    private void addQuestion() {
        questionCount++;
        Question q = new Question();

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
        qPanel.setBorder(new EmptyBorder(14,18,16,18));
        qPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        qPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 220));

        // Cabecera
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setAlignmentX(Component.LEFT_ALIGNMENT);
        header.setMaximumSize(new Dimension(Integer.MAX_VALUE, 24));

        JLabel numLbl = new JLabel("Pregunta " + questionCount);
        numLbl.setFont(Theme.F_CARD);
        numLbl.setForeground(Theme.textPrimary());

        JButton delBtn = ghostBtn("Eliminar");
        delBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { delBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { delBtn.setForeground(Theme.textSecondary()); }
        });
        delBtn.addActionListener(e -> removeQuestion(q));
        header.add(numLbl, BorderLayout.WEST);
        header.add(delBtn, BorderLayout.EAST);

        // Campos en dos columnas: frase (ancha) | respuesta
        JPanel fieldsRow = new JPanel(new GridLayout(1, 2, 12, 0));
        fieldsRow.setOpaque(false);
        fieldsRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        fieldsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        q.sentence = new RoundedField("Escribe la frase con [___] donde va el hueco...");
        q.answer   = new RoundedField("Respuesta correcta");
        fieldsRow.add(q.sentence);
        fieldsRow.add(q.answer);

        // Etiquetas de campos
        JPanel labelsRow = new JPanel(new GridLayout(1, 2, 12, 0));
        labelsRow.setOpaque(false);
        labelsRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        labelsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 16));
        labelsRow.add(fieldLbl("Frase con hueco  [___]"));
        labelsRow.add(fieldLbl("Respuesta correcta"));

        // Explicación
        JLabel expLbl = fieldLbl("Explicacion adicional");
        expLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        q.explanation = new RoundedField("Añade una pista o explicacion para el jugador...");
        q.explanation.setAlignmentX(Component.LEFT_ALIGNMENT);
        q.explanation.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        qPanel.add(header);
        qPanel.add(Box.createVerticalStrut(8));
        qPanel.add(labelsRow);
        qPanel.add(Box.createVerticalStrut(4));
        qPanel.add(fieldsRow);
        qPanel.add(Box.createVerticalStrut(10));
        qPanel.add(expLbl);
        qPanel.add(Box.createVerticalStrut(4));
        qPanel.add(q.explanation);

        q.panel = qPanel;
        questions.add(q);
        questionsPanel.add(qPanel);
        questionsPanel.add(Box.createVerticalStrut(12));
        questionsPanel.revalidate();
        questionsPanel.repaint();

        SwingUtilities.invokeLater(() -> {
            JScrollBar vsb = scroll.getVerticalScrollBar();
            vsb.setValue(vsb.getMaximum());
        });
    }

    private void removeQuestion(Question q) {
        questions.remove(q);
        Component[] comps = questionsPanel.getComponents();
        for (int i = 0; i < comps.length; i++) {
            if (comps[i] == q.panel) {
                questionsPanel.remove(i);
                if (i < questionsPanel.getComponentCount()) questionsPanel.remove(i);
                break;
            }
        }
        renumber();
        questionsPanel.revalidate();
        questionsPanel.repaint();
    }

    private void renumber() {
        questionCount = 0;
        for (Question q : questions) {
            questionCount++;
            JPanel h = (JPanel) q.panel.getComponent(0);
            ((JLabel)((BorderLayout)h.getLayout()).getLayoutComponent(BorderLayout.WEST))
                .setText("Pregunta " + questionCount);
        }
    }

    private void saveGame() {
        String title = gameTitleField.getText().trim();
        if (title.isEmpty()) { showMsg("El titulo no puede estar vacio.", false); return; }
        if (questions.isEmpty()) { showMsg("Agrega al menos una pregunta.", false); return; }
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            if (q.sentence.getText().trim().isEmpty()) {
                showMsg("La pregunta " + (i+1) + " no tiene frase.", false); return;
            }
            if (!q.sentence.getText().contains("[___]")) {
                showMsg("La pregunta " + (i+1) + " no contiene [___] para el hueco.", false); return;
            }
            if (q.answer.getText().trim().isEmpty()) {
                showMsg("La pregunta " + (i+1) + " no tiene respuesta correcta.", false); return;
            }
        }
        showMsg("Juego \"" + title + "\" guardado con " + questions.size() + " pregunta(s).", true);
    }

    private void showMsg(String text, boolean ok) {
        JOptionPane.showMessageDialog(this, text, ok ? "Guardado" : "Aviso", JOptionPane.PLAIN_MESSAGE);
    }

    private JLabel fieldLbl(String text) {
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
                thumbColor = Theme.border(); trackColor = Theme.bg();
            }
            @Override protected JButton createDecreaseButton(int o) { return zeroBtn(); }
            @Override protected JButton createIncreaseButton(int o) { return zeroBtn(); }
            private JButton zeroBtn() { JButton b = new JButton(); b.setPreferredSize(new Dimension(0,0)); return b; }
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
        addMouseListener(new MouseAdapter() { public void mousePressed(MouseEvent e) { s[0] = e.getPoint(); } });
        addMouseMotionListener(new MouseMotionAdapter() {
            public void mouseDragged(MouseEvent e) {
                if (s[0]==null) return;
                Point loc = getLocation();
                setLocation(loc.x+e.getX()-s[0].x, loc.y+e.getY()-s[0].y);
            }
        });
    }
}
