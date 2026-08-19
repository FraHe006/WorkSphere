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
 * Formulario para juegos de Conversacion.
 *
 * Reglas:
 *  - Puntuadores A y B siempre presentes. C es opcional (boton para agregar/quitar).
 *  - Cada puntuador tiene UN rango min/max y UN desenlace.
 *  - Cada dialogo tiene exactamente 2 opciones de respuesta (A y B).
 *  - Cada opcion tiene: texto + explicacion + peso en cada puntuador activo.
 *  - Al agregar/quitar el Puntuador C los spinners de peso se actualizan en todos los dialogos.
 *  - Mensaje de despedida final editable.
 */
public class ConversationWindow extends JFrame {

    // ── Modelos ───────────────────────────────────────────────────────────────

    private static class Scorer {
        RoundedField name, outcome;
        JSpinner     minSpin, maxSpin;
    }

    private static class Option {
        RoundedField text, explanation;
        JSpinner[]   weights = new JSpinner[3]; // siempre 3 creados, se muestran 2 o 3
        JPanel       panel;
    }

    private static class DialogLine {
        RoundedField prompt;
        Option[]     options = new Option[2];   // siempre exactamente 2
        JPanel       panel, optBox, optHead;
    }

    // ── Estado ───────────────────────────────────────────────────────────────

    private RoundedField           gameTitleField, farewellField;
    private final Scorer[]         scorers = new Scorer[3];
    private int                    activeScorers = 2;
    private JPanel                 scorerCSlot;
    private final List<DialogLine> dialogs = new ArrayList<>();
    private JPanel                 dialogsPanel;
    private JScrollPane            mainScroll;
    private int                    dialogCount = 0;

    private static final String[] SC_NAMES = {"Puntuador A", "Puntuador B", "Puntuador C"};

    // ── Constructor ──────────────────────────────────────────────────────────

    public ConversationWindow(JFrame parent) {
        super("Demo — Conversacion");
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        int w = (int)(sc.width * 0.84), h = (int)(sc.height * 0.88);
        setSize(w, h);
        setLocationRelativeTo(parent);
        setShape(new RoundRectangle2D.Double(0,0,w,h,12,12));
        for (int i=0;i<3;i++) scorers[i] = buildScorer(i);
        buildUI();
        addDialog();
        addDragSupport();
    }

    // ── Estructura ───────────────────────────────────────────────────────────

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
        root.add(buildScroll(),    BorderLayout.CENTER);
        root.add(buildBottomBar(), BorderLayout.SOUTH);
    }

    // ── Barra superior ───────────────────────────────────────────────────────

    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(12,18,0,18));

        JLabel lbl = lbl("Demo  /  Conversacion", Theme.textSecondary(), Theme.F_LABEL);

        JButton x = ghostBtn("x");
        x.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { x.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { x.setForeground(Theme.textSecondary()); }
        });
        x.addActionListener(e -> dispose());

        bar.add(lbl, BorderLayout.WEST);
        bar.add(x,   BorderLayout.EAST);

        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(new EmptyBorder(10,0,0,0));
        sepWrap.add(sep);

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(bar,     BorderLayout.CENTER);
        wrap.add(sepWrap, BorderLayout.SOUTH);
        return wrap;
    }

    // ── Scroll principal ─────────────────────────────────────────────────────

    private JScrollPane buildScroll() {
        JPanel c = new JPanel();
        c.setLayout(new BoxLayout(c, BoxLayout.Y_AXIS));
        c.setOpaque(false);
        c.setBorder(new EmptyBorder(22,30,22,30));

        // Titulo del juego
        c.add(secLabel("Titulo del juego"));
        c.add(Box.createVerticalStrut(8));
        gameTitleField = new RoundedField("Escribe el titulo del juego...");
        gameTitleField.setAlignmentX(Component.LEFT_ALIGNMENT);
        gameTitleField.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        c.add(gameTitleField);
        c.add(Box.createVerticalStrut(22));
        c.add(divider());
        c.add(Box.createVerticalStrut(22));

        // Puntuadores
        c.add(secLabel("Puntuadores"));
        c.add(Box.createVerticalStrut(10));
        c.add(buildScorersRow());
        c.add(Box.createVerticalStrut(22));
        c.add(divider());
        c.add(Box.createVerticalStrut(22));

        // Dialogos
        c.add(secLabel("Dialogos  (cada uno con 2 opciones de respuesta)"));
        c.add(Box.createVerticalStrut(10));
        dialogsPanel = new JPanel();
        dialogsPanel.setLayout(new BoxLayout(dialogsPanel, BoxLayout.Y_AXIS));
        dialogsPanel.setOpaque(false);
        dialogsPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        c.add(dialogsPanel);
        c.add(Box.createVerticalStrut(22));
        c.add(divider());
        c.add(Box.createVerticalStrut(22));

        // Despedida
        c.add(secLabel("Mensaje de despedida final"));
        c.add(Box.createVerticalStrut(4));
        JLabel hint = lbl("Se muestra siempre al finalizar, independiente del desenlace.", Theme.textSecondary(), Theme.F_SMALL);
        hint.setAlignmentX(Component.LEFT_ALIGNMENT);
        c.add(hint);
        c.add(Box.createVerticalStrut(8));
        farewellField = new RoundedField("Gracias por jugar. Hasta la proxima.");
        farewellField.setAlignmentX(Component.LEFT_ALIGNMENT);
        farewellField.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        c.add(farewellField);

        mainScroll = new JScrollPane(c);
        mainScroll.setOpaque(false);
        mainScroll.getViewport().setOpaque(false);
        mainScroll.setBorder(null);
        mainScroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        mainScroll.getVerticalScrollBar().setUnitIncrement(16);
        styleScrollBar(mainScroll);
        return mainScroll;
    }

    // ── Fila de puntuadores ──────────────────────────────────────────────────

    private JPanel buildScorersRow() {
        JPanel row = new JPanel(new GridLayout(1,3,14,0));
        row.setOpaque(false);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 9999));

        row.add(scorerCard(0));
        row.add(scorerCard(1));

        // Slot C: empieza como placeholder
        scorerCSlot = buildCSlot();
        row.add(scorerCSlot);
        return row;
    }

    private Scorer buildScorer(int idx) {
        Scorer sc = new Scorer();
        sc.name    = new RoundedField(SC_NAMES[idx]);
        sc.minSpin = styledSpinner(0);
        sc.maxSpin = styledSpinner(10);
        sc.outcome = new RoundedField("Describe el desenlace para este rango...");
        return sc;
    }

    /** Tarjeta visual de un puntuador (A o B, siempre visibles) */
    private JPanel scorerCard(int idx) {
        Scorer sc = scorers[idx];
        JPanel card = new JPanel(new BorderLayout()) {
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
        card.setOpaque(false);

        JPanel inner = new JPanel();
        inner.setLayout(new BoxLayout(inner, BoxLayout.Y_AXIS));
        inner.setOpaque(false);
        inner.setBorder(new EmptyBorder(14,16,16,16));

        JLabel title = lbl("Puntuador " + (char)('A'+idx), Theme.textPrimary(), Theme.F_CARD);
        title.setAlignmentX(Component.LEFT_ALIGNMENT);

        sc.name.setAlignmentX(Component.LEFT_ALIGNMENT);
        sc.name.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        JLabel rangeLbl = lbl("Rango de puntuacion total", Theme.textSecondary(), Theme.F_LABEL);
        rangeLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        JPanel rangeRow = new JPanel(new GridLayout(1,2,8,0));
        rangeRow.setOpaque(false);
        rangeRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        rangeRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 54));
        rangeRow.add(spinnerBlock("Min", sc.minSpin));
        rangeRow.add(spinnerBlock("Max", sc.maxSpin));

        JLabel outLbl = lbl("Desenlace si la puntuacion cae en este rango", Theme.textSecondary(), Theme.F_LABEL);
        outLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        sc.outcome.setAlignmentX(Component.LEFT_ALIGNMENT);
        sc.outcome.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        inner.add(title);
        inner.add(Box.createVerticalStrut(8));
        inner.add(sc.name);
        inner.add(Box.createVerticalStrut(12));
        inner.add(thinDiv());
        inner.add(Box.createVerticalStrut(10));
        inner.add(rangeLbl);
        inner.add(Box.createVerticalStrut(5));
        inner.add(rangeRow);
        inner.add(Box.createVerticalStrut(10));
        inner.add(outLbl);
        inner.add(Box.createVerticalStrut(5));
        inner.add(sc.outcome);

        card.add(inner, BorderLayout.CENTER);
        return card;
    }

    /** Slot del Puntuador C: placeholder con boton de agregar o tarjeta activa */
    private JPanel buildCSlot() {
        JPanel slot = new JPanel(new GridBagLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bgCard());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),8,8));
                float[] dash = {7,5};
                g2.setStroke(new BasicStroke(1f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 1f, dash, 0));
                g2.setColor(Theme.border());
                g2.draw(new RoundRectangle2D.Float(1,1,getWidth()-2,getHeight()-2,8,8));
                g2.dispose();
            }
        };
        slot.setOpaque(false);

        PrimaryButton addBtn = new PrimaryButton("+ Agregar Puntuador C");
        addBtn.setPreferredSize(new Dimension(180, Theme.BH));
        addBtn.addActionListener(e -> activateScorerC(slot));

        slot.add(addBtn);
        return slot;
    }

    private void activateScorerC(JPanel slot) {
        activeScorers = 3;
        Scorer sc = scorers[2];

        JPanel card = new JPanel(new BorderLayout()) {
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
        card.setOpaque(false);

        JPanel inner = new JPanel();
        inner.setLayout(new BoxLayout(inner, BoxLayout.Y_AXIS));
        inner.setOpaque(false);
        inner.setBorder(new EmptyBorder(14,16,16,16));

        // Cabecera con boton de quitar
        JPanel head = new JPanel(new BorderLayout());
        head.setOpaque(false);
        head.setMaximumSize(new Dimension(Integer.MAX_VALUE, 24));
        head.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel title = lbl("Puntuador C", Theme.textPrimary(), Theme.F_CARD);
        JButton removeBtn = ghostBtn("Quitar");
        removeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { removeBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { removeBtn.setForeground(Theme.textSecondary()); }
        });
        removeBtn.addActionListener(e -> deactivateScorerC(slot));
        head.add(title,     BorderLayout.WEST);
        head.add(removeBtn, BorderLayout.EAST);

        sc.name.setAlignmentX(Component.LEFT_ALIGNMENT);
        sc.name.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        JLabel rangeLbl = lbl("Rango de puntuacion total", Theme.textSecondary(), Theme.F_LABEL);
        rangeLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        JPanel rangeRow = new JPanel(new GridLayout(1,2,8,0));
        rangeRow.setOpaque(false);
        rangeRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        rangeRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 54));
        rangeRow.add(spinnerBlock("Min", sc.minSpin));
        rangeRow.add(spinnerBlock("Max", sc.maxSpin));

        JLabel outLbl = lbl("Desenlace si la puntuacion cae en este rango", Theme.textSecondary(), Theme.F_LABEL);
        outLbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        sc.outcome.setAlignmentX(Component.LEFT_ALIGNMENT);
        sc.outcome.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        inner.add(head);
        inner.add(Box.createVerticalStrut(8));
        inner.add(sc.name);
        inner.add(Box.createVerticalStrut(12));
        inner.add(thinDiv());
        inner.add(Box.createVerticalStrut(10));
        inner.add(rangeLbl);
        inner.add(Box.createVerticalStrut(5));
        inner.add(rangeRow);
        inner.add(Box.createVerticalStrut(10));
        inner.add(outLbl);
        inner.add(Box.createVerticalStrut(5));
        inner.add(sc.outcome);

        card.add(inner, BorderLayout.CENTER);

        slot.removeAll();
        slot.setLayout(new BorderLayout());
        slot.add(card, BorderLayout.CENTER);
        slot.revalidate();
        slot.repaint();
        syncDialogWeights();
    }

    private void deactivateScorerC(JPanel slot) {
        activeScorers = 2;
        slot.removeAll();
        slot.setLayout(new GridBagLayout());
        PrimaryButton addBtn = new PrimaryButton("+ Agregar Puntuador C");
        addBtn.setPreferredSize(new Dimension(180, Theme.BH));
        addBtn.addActionListener(e -> activateScorerC(slot));
        slot.add(addBtn);
        slot.revalidate();
        slot.repaint();
        syncDialogWeights();
    }

    /** Rebuild weight spinners in every dialog to match activeScorers */
    private void syncDialogWeights() {
        for (DialogLine dl : dialogs) {
            // Rebuild optHead
            dl.optHead.removeAll();
            dl.optHead.setLayout(new GridLayout(1, 1 + activeScorers, 8, 0));
            dl.optHead.add(lbl("Respuesta", Theme.textSecondary(), Theme.F_LABEL));
            for (int i=0; i<activeScorers; i++)
                dl.optHead.add(lbl("Peso " + SC_NAMES[i], Theme.textSecondary(), Theme.F_LABEL));
            dl.optHead.revalidate();
            dl.optHead.repaint();

            // Rebuild each option's row
            for (int i=0; i<2; i++) {
                Option opt = dl.options[i];
                opt.panel = buildOptionPanel(opt, i);
            }
            dl.optBox.removeAll();
            for (int i=0; i<2; i++) {
                dl.optBox.add(dl.options[i].panel);
                if (i<1) dl.optBox.add(Box.createVerticalStrut(10));
            }
            dl.optBox.revalidate();
            dl.optBox.repaint();
            dl.panel.revalidate();
            dl.panel.repaint();
        }
    }

    // ── Dialogo ──────────────────────────────────────────────────────────────

    private void addDialog() {
        dialogCount++;
        DialogLine dl = new DialogLine();
        dl.options[0] = buildOption(0);
        dl.options[1] = buildOption(1);

        JPanel dPanel = new JPanel() {
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
        dPanel.setLayout(new BoxLayout(dPanel, BoxLayout.Y_AXIS));
        dPanel.setOpaque(false);
        dPanel.setBorder(new EmptyBorder(14,18,16,18));
        dPanel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Cabecera
        JPanel head = new JPanel(new BorderLayout());
        head.setOpaque(false);
        head.setAlignmentX(Component.LEFT_ALIGNMENT);
        head.setMaximumSize(new Dimension(Integer.MAX_VALUE, 26));

        JLabel numLbl = lbl("Dialogo " + dialogCount, Theme.textPrimary(), Theme.F_CARD);
        numLbl.setName("dlgnum");

        JButton delBtn = ghostBtn("Eliminar");
        delBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { delBtn.setForeground(Theme.error()); }
            public void mouseExited (MouseEvent e) { delBtn.setForeground(Theme.textSecondary()); }
        });
        delBtn.addActionListener(e -> removeDialog(dl));
        head.add(numLbl, BorderLayout.WEST);
        head.add(delBtn, BorderLayout.EAST);

        // Prompt
        JLabel promptLbl = lbl("Texto que lee el usuario", Theme.textSecondary(), Theme.F_LABEL);
        promptLbl.setAlignmentX(Component.LEFT_ALIGNMENT);
        dl.prompt = new RoundedField("Escribe el dialogo o pregunta...");
        dl.prompt.setAlignmentX(Component.LEFT_ALIGNMENT);
        dl.prompt.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        // Cabecera columnas opciones
        dl.optHead = new JPanel(new GridLayout(1, 1 + activeScorers, 8, 0));
        dl.optHead.setOpaque(false);
        dl.optHead.setAlignmentX(Component.LEFT_ALIGNMENT);
        dl.optHead.setMaximumSize(new Dimension(Integer.MAX_VALUE, 16));
        dl.optHead.add(lbl("Respuesta", Theme.textSecondary(), Theme.F_LABEL));
        for (int i=0; i<activeScorers; i++)
            dl.optHead.add(lbl("Peso " + SC_NAMES[i], Theme.textSecondary(), Theme.F_LABEL));

        // Opciones
        dl.optBox = new JPanel();
        dl.optBox.setLayout(new BoxLayout(dl.optBox, BoxLayout.Y_AXIS));
        dl.optBox.setOpaque(false);
        dl.optBox.setAlignmentX(Component.LEFT_ALIGNMENT);
        for (int i=0; i<2; i++) {
            dl.optBox.add(dl.options[i].panel);
            if (i<1) dl.optBox.add(Box.createVerticalStrut(10));
        }

        dPanel.add(head);
        dPanel.add(Box.createVerticalStrut(10));
        dPanel.add(promptLbl);
        dPanel.add(Box.createVerticalStrut(4));
        dPanel.add(dl.prompt);
        dPanel.add(Box.createVerticalStrut(12));
        dPanel.add(thinDiv());
        dPanel.add(Box.createVerticalStrut(10));
        dPanel.add(lbl("Opciones de respuesta", Theme.textSecondary(), Theme.F_LABEL));
        dPanel.add(Box.createVerticalStrut(6));
        dPanel.add(dl.optHead);
        dPanel.add(Box.createVerticalStrut(5));
        dPanel.add(dl.optBox);

        dl.panel = dPanel;
        dialogs.add(dl);
        dialogsPanel.add(dPanel);
        dialogsPanel.add(Box.createVerticalStrut(14));
        dialogsPanel.revalidate();
        dialogsPanel.repaint();

        SwingUtilities.invokeLater(() -> {
            JScrollBar v = mainScroll.getVerticalScrollBar();
            v.setValue(v.getMaximum());
        });
    }

    private void removeDialog(DialogLine dl) {
        dialogs.remove(dl);
        Component[] cs = dialogsPanel.getComponents();
        for (int i=0; i<cs.length; i++) {
            if (cs[i] == dl.panel) {
                dialogsPanel.remove(i);
                if (i < dialogsPanel.getComponentCount()) dialogsPanel.remove(i);
                break;
            }
        }
        dialogCount = 0;
        for (DialogLine d : dialogs) {
            dialogCount++;
            JPanel h = (JPanel) d.panel.getComponent(0);
            for (Component c : h.getComponents())
                if (c instanceof JLabel && "dlgnum".equals(c.getName()))
                    ((JLabel)c).setText("Dialogo " + dialogCount);
        }
        dialogsPanel.revalidate();
        dialogsPanel.repaint();
    }

    // ── Opcion de respuesta ──────────────────────────────────────────────────

    private Option buildOption(int idx) {
        Option opt = new Option();
        opt.text        = new RoundedField("Texto de la opcion " + (char)('A'+idx) + "...");
        opt.explanation = new RoundedField("Explicacion: por que esta opcion lleva a ese resultado...");
        for (int i=0; i<3; i++) opt.weights[i] = styledSpinner(0);
        opt.panel = buildOptionPanel(opt, idx);
        return opt;
    }

    private JPanel buildOptionPanel(Option opt, int idx) {
        JPanel box = new JPanel();
        box.setLayout(new BoxLayout(box, BoxLayout.Y_AXIS));
        box.setOpaque(false);
        box.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel letter = lbl("Opcion " + (char)('A'+idx), Theme.textSecondary(), Theme.F_LABEL);
        letter.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Fila: texto + spinners
        JPanel row = new JPanel(new GridLayout(1, 1 + activeScorers, 8, 0));
        row.setOpaque(false);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        opt.text.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));
        row.add(opt.text);
        for (int i=0; i<activeScorers; i++) row.add(opt.weights[i]);

        // Explicacion
        opt.explanation.setAlignmentX(Component.LEFT_ALIGNMENT);
        opt.explanation.setMaximumSize(new Dimension(Integer.MAX_VALUE, Theme.IH));

        box.add(letter);
        box.add(Box.createVerticalStrut(3));
        box.add(row);
        box.add(Box.createVerticalStrut(4));
        box.add(opt.explanation);
        return box;
    }

    // ── Barra inferior ───────────────────────────────────────────────────────

    private JPanel buildBottomBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        bar.setOpaque(false);

        SecondaryButton templateBtn = new SecondaryButton("Abrir plantilla");
        SecondaryButton addBtn      = new SecondaryButton("+ Agregar dialogo");
        PrimaryButton   saveBtn     = new PrimaryButton("Guardar juego");
        templateBtn.setPreferredSize(new Dimension(140, Theme.BH));
        addBtn     .setPreferredSize(new Dimension(150, Theme.BH));
        saveBtn    .setPreferredSize(new Dimension(140, Theme.BH));
        templateBtn.addActionListener(e -> new TemplateEditor(this, TemplateEditor.GameType.CONVERSATION).setVisible(true));
        addBtn .addActionListener(e -> addDialog());
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

    // ── Guardar ──────────────────────────────────────────────────────────────

    private void saveGame() {
        String title = gameTitleField.getText().trim();
        if (title.isEmpty()) { showMsg("El titulo no puede estar vacio.", false); return; }
        for (int i=0; i<activeScorers; i++)
            if (scorers[i].outcome.getText().trim().isEmpty()) {
                showMsg(SC_NAMES[i] + " no tiene desenlace definido.", false); return;
            }
        if (dialogs.isEmpty()) { showMsg("Agrega al menos un dialogo.", false); return; }
        for (int i=0; i<dialogs.size(); i++) {
            DialogLine dl = dialogs.get(i);
            if (dl.prompt.getText().trim().isEmpty()) {
                showMsg("El dialogo " + (i+1) + " no tiene texto.", false); return;
            }
            for (int j=0; j<2; j++)
                if (dl.options[j].text.getText().trim().isEmpty()) {
                    showMsg("Dialogo " + (i+1) + ": la opcion " + (char)('A'+j) + " no tiene texto.", false); return;
                }
        }
        showMsg("Juego \"" + title + "\" guardado con " + dialogs.size() + " dialogo(s).\n" +
                "Despedida: \"" + farewellField.getText().trim() + "\"", true);
    }

    private void showMsg(String text, boolean ok) {
        JOptionPane.showMessageDialog(this, text, ok ? "Guardado" : "Aviso", JOptionPane.PLAIN_MESSAGE);
    }

    // ── Helpers visuales ─────────────────────────────────────────────────────

    /** Separador fino pintado: safe en BoxLayout (no usa JSeparator) */
    private JPanel thinDiv() {
        JPanel p = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                g.setColor(Theme.border());
                g.fillRect(0, 0, getWidth(), 1);
            }
        };
        p.setOpaque(false);
        p.setAlignmentX(Component.LEFT_ALIGNMENT);
        p.setMinimumSize(new Dimension(0, 1));
        p.setPreferredSize(new Dimension(0, 1));
        p.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));
        return p;
    }

    /** Separador de seccion (igual pero con margen visual) */
    private JPanel divider() {
        return thinDiv();
    }

    private JLabel secLabel(String text) {
        JLabel l = new JLabel(text);
        l.setFont(new Font("Segoe UI", Font.BOLD, 14));
        l.setForeground(Theme.textPrimary());
        l.setAlignmentX(Component.LEFT_ALIGNMENT);
        return l;
    }

    private JLabel lbl(String text, Color color, Font font) {
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

    /** Bloque spinner con etiqueta encima */
    private JPanel spinnerBlock(String label, JSpinner sp) {
        JPanel p = new JPanel(new BorderLayout(0,3));
        p.setOpaque(false);
        p.add(lbl(label, Theme.textSecondary(), Theme.F_LABEL), BorderLayout.NORTH);
        p.add(sp, BorderLayout.CENTER);
        return p;
    }

    private JSpinner styledSpinner(int val) {
        JSpinner sp = new JSpinner(new SpinnerNumberModel(val, -999, 999, 1));
        JSpinner.NumberEditor ed = new JSpinner.NumberEditor(sp, "#");
        sp.setEditor(ed);

        JTextField tf = ed.getTextField();
        tf.setHorizontalAlignment(JTextField.CENTER);
        tf.setFont(Theme.F_BODY);
        tf.setOpaque(true);
        tf.setForeground(Theme.textPrimary());
        tf.setBackground(Theme.inputBg());
        tf.setBorder(BorderFactory.createEmptyBorder(4,6,4,6));
        tf.setCaretColor(Theme.textPrimary());

        sp.setBorder(BorderFactory.createLineBorder(Theme.border(), 1));
        sp.setBackground(Theme.inputBg());
        sp.setOpaque(true);
        // Override UI background for spinner buttons
        for (Component child : sp.getComponents()) {
            if (child instanceof JButton) {
                ((JButton)child).setBackground(Theme.inputBg());
                ((JButton)child).setForeground(Theme.textPrimary());
                ((JButton)child).setOpaque(true);
            }
        }
        return sp;
    }

    private void styleScrollBar(JScrollPane sp) {
        sp.getVerticalScrollBar().setPreferredSize(new Dimension(6,0));
        sp.getVerticalScrollBar().setUI(new javax.swing.plaf.basic.BasicScrollBarUI() {
            @Override protected void configureScrollBarColors() {
                thumbColor = Theme.border(); trackColor = Theme.bg();
            }
            @Override protected JButton createDecreaseButton(int o) { return zb(); }
            @Override protected JButton createIncreaseButton(int o) { return zb(); }
            private JButton zb() { JButton b = new JButton(); b.setPreferredSize(new Dimension(0,0)); return b; }
        });
    }

    private static Graphics2D aa(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,      RenderingHints.VALUE_ANTIALIAS_ON);
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
                Point l = getLocation();
                setLocation(l.x+e.getX()-s[0].x, l.y+e.getY()-s[0].y);
            }
        });
    }
}
