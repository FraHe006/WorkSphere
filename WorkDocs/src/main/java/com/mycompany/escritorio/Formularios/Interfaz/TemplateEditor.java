package org.example.Formularios.Interfaz;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

/**
 * Ventana notebook para importar / exportar plantillas de juego en XML o CSV.
 * Muestra la estructura fija del formato junto a un area de texto editable.
 * Botones: Guardar fichero | Cancelar.
 */
public class TemplateEditor extends JDialog {

    public enum GameType {
        TRUE_FALSE,
        MATCHING,
        FILL_BLANK,
        CONVERSATION
    }

    private final GameType  gameType;
    private       JTextArea textArea;
    private       String    currentFilePath = null;

    // Paleta neutra gris, independiente del modo claro/oscuro del resto de la app
    private static final Color BG        = new Color(52,52,52);
    private static final Color BG_AREA   = new Color(38,38,38);
    private static final Color BG_TOP    = new Color(44,44,44);
    private static final Color FG        = new Color(220,220,220);
    private static final Color FG_DIM    = new Color(140,140,140);
    private static final Color BORDER_C  = new Color(70,70,70);
    private static final Color BTN_SAVE  = new Color(210,210,210);
    private static final Color BTN_SAVE_H= new Color(240,240,240);
    private static final Color BTN_FG    = new Color(30,30,30);
    private static final Color BTN_CANC  = new Color(65,65,65);
    private static final Color BTN_CANC_H= new Color(85,85,85);

    private static final Font F_TITLE = new Font("Segoe UI", Font.BOLD,  13);
    private static final Font F_BODY  = new Font("Consolas", Font.PLAIN, 12);
    private static final Font F_SMALL = new Font("Segoe UI", Font.PLAIN, 11);
    private static final Font F_BTN   = new Font("Segoe UI", Font.BOLD,  12);

    // ── Constructor ──────────────────────────────────────────────────────────

    public TemplateEditor(JFrame parent, GameType type) {
        super(parent, "Plantilla — " + label(type), false);
        this.gameType = type;
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        int w = Math.min(860, (int)(sc.width  * 0.70));
        int h = Math.min(700, (int)(sc.height * 0.80));
        setSize(w, h);
        setLocationRelativeTo(parent);
        setShape(new RoundRectangle2D.Double(0,0,w,h,10,10));
        buildUI();
        addDragSupport();
    }

    // ── UI ───────────────────────────────────────────────────────────────────

    private void buildUI() {
        JPanel root = new JPanel(new BorderLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(BG);
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),10,10));
                g2.dispose();
            }
        };
        root.setOpaque(false);
        setContentPane(root);

        root.add(buildTop(),    BorderLayout.NORTH);
        root.add(buildCenter(), BorderLayout.CENTER);
        root.add(buildBottom(), BorderLayout.SOUTH);
    }

    // ── Barra superior ───────────────────────────────────────────────────────

    private JPanel buildTop() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBackground(BG_TOP);
        bar.setBorder(new EmptyBorder(11,16,0,16));

        JLabel title = new JLabel("Plantilla: " + label(gameType));
        title.setFont(F_TITLE);
        title.setForeground(FG);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        right.setOpaque(false);

        JButton openBtn = ghostBtn("Abrir fichero...");
        openBtn.addActionListener(e -> openFile());

        JButton closeBtn = ghostBtn("x");
        closeBtn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { closeBtn.setForeground(new Color(200,80,80)); }
            public void mouseExited (MouseEvent e) { closeBtn.setForeground(FG_DIM); }
        });
        closeBtn.addActionListener(e -> dispose());

        right.add(openBtn);
        right.add(closeBtn);
        bar.add(title, BorderLayout.WEST);
        bar.add(right, BorderLayout.EAST);

        // Separador
        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.setBackground(BG_TOP);
        wrap.add(bar, BorderLayout.CENTER);
        JPanel sepLine = new JPanel();
        sepLine.setPreferredSize(new Dimension(0, 1));
        sepLine.setBackground(BORDER_C);
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(new EmptyBorder(10,0,0,0));
        sepWrap.add(sepLine, BorderLayout.CENTER);
        wrap.add(sepWrap, BorderLayout.SOUTH);
        return wrap;
    }

    // ── Centro: instrucciones + editor ───────────────────────────────────────

    private JPanel buildCenter() {
        JPanel c = new JPanel(new BorderLayout(0, 0));
        c.setOpaque(false);

        // Panel de instrucciones (izquierda)
        JPanel instrPanel = new JPanel(new BorderLayout());
        instrPanel.setOpaque(false);
        instrPanel.setPreferredSize(new Dimension(240, 0));
        instrPanel.setBorder(new EmptyBorder(14, 16, 14, 10));

        JLabel instrTitle = new JLabel("Como usar esta plantilla");
        instrTitle.setFont(F_TITLE);
        instrTitle.setForeground(FG);

        JTextArea instrArea = new JTextArea(buildInstructions());
        instrArea.setFont(F_SMALL);
        instrArea.setForeground(FG_DIM);
        instrArea.setBackground(BG);
        instrArea.setOpaque(true);
        instrArea.setEditable(false);
        instrArea.setLineWrap(true);
        instrArea.setWrapStyleWord(true);
        instrArea.setBorder(new EmptyBorder(8, 0, 0, 0));

        instrPanel.add(instrTitle,  BorderLayout.NORTH);
        instrPanel.add(instrArea,   BorderLayout.CENTER);

        // Divisor vertical
        JPanel vDiv = new JPanel();
        vDiv.setPreferredSize(new Dimension(1, 0));
        vDiv.setBackground(BORDER_C);
        vDiv.setOpaque(true);

        // Editor (derecha)
        JPanel editorPanel = new JPanel(new BorderLayout());
        editorPanel.setOpaque(false);
        editorPanel.setBorder(new EmptyBorder(14, 10, 0, 14));

        JLabel editorTitle = new JLabel("Editor  (XML / CSV)");
        editorTitle.setFont(F_TITLE);
        editorTitle.setForeground(FG);
        editorTitle.setBorder(new EmptyBorder(0,0,8,0));

        textArea = new JTextArea(buildTemplate());
        textArea.setFont(F_BODY);
        textArea.setForeground(FG);
        textArea.setBackground(BG_AREA);
        textArea.setOpaque(true);
        textArea.setCaretColor(FG);
        textArea.setSelectionColor(new Color(90,90,100));
        textArea.setSelectedTextColor(FG);
        textArea.setLineWrap(false);
        textArea.setBorder(new EmptyBorder(10,12,10,12));

        JScrollPane scroll = new JScrollPane(textArea);
        scroll.setOpaque(false);
        scroll.getViewport().setOpaque(true);
        scroll.getViewport().setBackground(BG_AREA);
        scroll.setBorder(BorderFactory.createLineBorder(BORDER_C, 1));
        styleScrollBar(scroll);

        editorPanel.add(editorTitle, BorderLayout.NORTH);
        editorPanel.add(scroll,      BorderLayout.CENTER);

        c.add(instrPanel,  BorderLayout.WEST);
        c.add(vDiv,        BorderLayout.CENTER);
        c.add(editorPanel, BorderLayout.EAST);

        // Hacer que editorPanel ocupe el resto del espacio
        c.remove(vDiv);
        c.remove(editorPanel);
        JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, instrPanel, editorPanel);
        split.setDividerLocation(230);
        split.setDividerSize(1);
        split.setBackground(BORDER_C);
        split.setOpaque(true);
        split.setBorder(null);
        split.setContinuousLayout(true);
        c.add(split, BorderLayout.CENTER);

        return c;
    }

    // ── Barra inferior ───────────────────────────────────────────────────────

    private JPanel buildBottom() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        bar.setOpaque(false);
        bar.setBorder(new EmptyBorder(0, 16, 4, 16));

        // Boton Guardar
        JButton saveBtn = roundedBtn("Guardar fichero", BTN_SAVE, BTN_SAVE_H, BTN_FG);
        saveBtn.addActionListener(e -> saveFile());

        // Boton Cancelar
        JButton cancelBtn = roundedBtn("Cancelar", BTN_CANC, BTN_CANC_H, FG);
        cancelBtn.addActionListener(e -> dispose());

        // Separador
        JPanel sepLine = new JPanel();
        sepLine.setBackground(BORDER_C);
        sepLine.setPreferredSize(new Dimension(0,1));
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(new EmptyBorder(0,16,0,16));
        sepWrap.add(sepLine, BorderLayout.CENTER);

        JPanel wrap = new JPanel(new BorderLayout());
        wrap.setOpaque(false);
        wrap.add(sepWrap, BorderLayout.NORTH);
        wrap.add(bar,     BorderLayout.CENTER);

        bar.add(saveBtn);
        bar.add(cancelBtn);
        return wrap;
    }

    // ── Plantillas de estructura fija ────────────────────────────────────────

    private String buildTemplate() {
        switch (gameType) {
            case TRUE_FALSE:   return trueFalseXml();
            case MATCHING:     return matchingXml();
            case FILL_BLANK:   return fillBlankXml();
            case CONVERSATION: return conversationXml();
            default:           return "";
        }
    }

    private String buildInstructions() {
        switch (gameType) {
            case TRUE_FALSE:
                return "Juego de Verdadero / Falso\n\n" +
                       "Cada bloque <pregunta> contiene:\n" +
                       " • <enunciado>: texto de la pregunta\n" +
                       " • <respuesta>: 'verdadero' o 'falso'\n" +
                       " • <explicacion>: texto de ayuda\n\n" +
                       "Puedes copiar el bloque <pregunta> tantas veces como necesites.\n\n" +
                       "Formato CSV disponible debajo del XML como alternativa.";
            case MATCHING:
                return "Juego de Unir Conceptos\n\n" +
                       "Cada bloque <pareja> contiene:\n" +
                       " • <termino>: concepto izquierdo\n" +
                       " • <definicion>: par o definicion\n" +
                       " • <explicacion>: texto de ayuda\n\n" +
                       "Incluye tantos bloques <pareja> como necesites.";
            case FILL_BLANK:
                return "Juego de Rellenar Frases\n\n" +
                       "Cada <pregunta> contiene:\n" +
                       " • <frase>: texto completo con [___] donde va el hueco\n" +
                       " • <respuesta>: palabra o frase correcta\n" +
                       " • <explicacion>: pista o aclaracion\n\n" +
                       "Usa exactamente [___] para marcar el hueco.";
            case CONVERSATION:
                return "Juego de Conversacion\n\n" +
                       "Seccion <puntuadores>: define A, B y opcionalmente C. Cada uno con nombre, rango min/max y el texto del desenlace.\n\n" +
                       "Seccion <dialogos>: cada <dialogo> tiene un <prompt> y exactamente dos <opcion> (A y B). Cada opcion incluye su texto, explicacion y los pesos para cada puntuador.\n\n" +
                       "<despedida>: mensaje final fijo.\n\n" +
                       "Los pesos pueden ser negativos.";
            default: return "";
        }
    }

    // ── XML de cada tipo ─────────────────────────────────────────────────────

    private String trueFalseXml() {
        return
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
"<juego tipo=\"verdadero-falso\">\n" +
"\n" +
"  <titulo>Escribe aqui el titulo del juego</titulo>\n" +
"\n" +
"  <!-- Repite el bloque <pregunta> por cada pregunta -->\n" +
"  <preguntas>\n" +
"\n" +
"    <pregunta>\n" +
"      <enunciado>La Tierra orbita alrededor del Sol.</enunciado>\n" +
"      <respuesta>verdadero</respuesta>\n" +
"      <explicacion>La Tierra es el tercer planeta del sistema solar y orbita al Sol cada 365 dias.</explicacion>\n" +
"    </pregunta>\n" +
"\n" +
"    <pregunta>\n" +
"      <enunciado>El agua hierve a 50 grados Celsius al nivel del mar.</enunciado>\n" +
"      <respuesta>falso</respuesta>\n" +
"      <explicacion>El agua hierve a 100 grados Celsius en condiciones normales de presion.</explicacion>\n" +
"    </pregunta>\n" +
"\n" +
"    <!-- Agrega mas preguntas aqui -->\n" +
"\n" +
"  </preguntas>\n" +
"\n" +
"</juego>\n" +
"\n" +
"<!-- ====================== ALTERNATIVA CSV ====================== -->\n" +
"<!-- Si prefieres CSV, usa el siguiente formato (elimina el XML):\n" +
"\n" +
"titulo,enunciado,respuesta,explicacion\n" +
"Mi juego,La Tierra orbita al Sol.,verdadero,Es el tercer planeta del sistema solar.\n" +
"Mi juego,El agua hierve a 50 grados.,falso,El agua hierve a 100 grados al nivel del mar.\n" +
"\n" +
"-->";
    }

    private String matchingXml() {
        return
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
"<juego tipo=\"unir-conceptos\">\n" +
"\n" +
"  <titulo>Escribe aqui el titulo del juego</titulo>\n" +
"\n" +
"  <!-- Repite el bloque <pareja> por cada par de conceptos -->\n" +
"  <parejas>\n" +
"\n" +
"    <pareja>\n" +
"      <termino>Fotosintesis</termino>\n" +
"      <definicion>Proceso por el que las plantas convierten luz en energia</definicion>\n" +
"      <explicacion>Ocurre en los cloroplastos usando luz solar, agua y CO2.</explicacion>\n" +
"    </pareja>\n" +
"\n" +
"    <pareja>\n" +
"      <termino>Mitosis</termino>\n" +
"      <definicion>Division celular que produce dos celulas identicas</definicion>\n" +
"      <explicacion>Es el mecanismo de reproduccion de las celulas somaticas.</explicacion>\n" +
"    </pareja>\n" +
"\n" +
"    <!-- Agrega mas parejas aqui -->\n" +
"\n" +
"  </parejas>\n" +
"\n" +
"</juego>\n" +
"\n" +
"<!-- ====================== ALTERNATIVA CSV ====================== -->\n" +
"<!-- Si prefieres CSV, elimina el XML y usa:\n" +
"\n" +
"titulo,termino,definicion,explicacion\n" +
"Mi juego,Fotosintesis,Proceso de conversion de luz en energia,Ocurre en los cloroplastos.\n" +
"Mi juego,Mitosis,Division celular en dos celulas identicas,Es la reproduccion de celulas somaticas.\n" +
"\n" +
"-->";
    }

    private String fillBlankXml() {
        return
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
"<juego tipo=\"rellenar-frases\">\n" +
"\n" +
"  <titulo>Escribe aqui el titulo del juego</titulo>\n" +
"\n" +
"  <!-- IMPORTANTE: usa [___] exactamente para marcar el hueco en cada frase -->\n" +
"  <preguntas>\n" +
"\n" +
"    <pregunta>\n" +
"      <frase>La capital de Francia es [___].</frase>\n" +
"      <respuesta>Paris</respuesta>\n" +
"      <explicacion>Paris es la capital y ciudad mas poblada de Francia.</explicacion>\n" +
"    </pregunta>\n" +
"\n" +
"    <pregunta>\n" +
"      <frase>El simbolo quimico del oro es [___].</frase>\n" +
"      <respuesta>Au</respuesta>\n" +
"      <explicacion>Au proviene del latin Aurum, nombre clasico del oro.</explicacion>\n" +
"    </pregunta>\n" +
"\n" +
"    <!-- Agrega mas preguntas aqui -->\n" +
"\n" +
"  </preguntas>\n" +
"\n" +
"</juego>\n" +
"\n" +
"<!-- ====================== ALTERNATIVA CSV ====================== -->\n" +
"<!-- Si prefieres CSV, elimina el XML y usa:\n" +
"\n" +
"titulo,frase,respuesta,explicacion\n" +
"Mi juego,La capital de Francia es [___].,Paris,Paris es la capital de Francia.\n" +
"Mi juego,El simbolo del oro es [___].,Au,Au proviene del latin Aurum.\n" +
"\n" +
"-->";
    }

    private String conversationXml() {
        return
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
"<juego tipo=\"conversacion\">\n" +
"\n" +
"  <titulo>Escribe aqui el titulo del juego</titulo>\n" +
"\n" +
"  <!-- Define los puntuadores. C es opcional: elimina el bloque si no lo usas -->\n" +
"  <puntuadores>\n" +
"\n" +
"    <puntuador id=\"A\">\n" +
"      <nombre>Confianza</nombre>\n" +
"      <rango min=\"0\" max=\"5\"/>\n" +
"      <desenlace>Tu nivel de confianza es bajo. Practica mas.</desenlace>\n" +
"    </puntuador>\n" +
"\n" +
"    <puntuador id=\"B\">\n" +
"      <nombre>Empatia</nombre>\n" +
"      <rango min=\"6\" max=\"10\"/>\n" +
"      <desenlace>Tu empatia es alta. Has logrado conectar con el personaje.</desenlace>\n" +
"    </puntuador>\n" +
"\n" +
"    <!-- Puntuador C es opcional -->\n" +
"    <puntuador id=\"C\">\n" +
"      <nombre>Liderazgo</nombre>\n" +
"      <rango min=\"0\" max=\"10\"/>\n" +
"      <desenlace>Has demostrado capacidad de liderazgo en la conversacion.</desenlace>\n" +
"    </puntuador>\n" +
"\n" +
"  </puntuadores>\n" +
"\n" +
"  <!-- Cada dialogo tiene exactamente 2 opciones (A y B) -->\n" +
"  <dialogos>\n" +
"\n" +
"    <dialogo>\n" +
"      <prompt>El cliente llega furioso y dice: no funciona nada. ¿Como respondes?</prompt>\n" +
"      <opciones>\n" +
"        <opcion id=\"A\">\n" +
"          <texto>Entiendo su frustracion, vamos a resolverlo juntos.</texto>\n" +
"          <explicacion>Respuesta empatica. Reduce la tension y genera confianza.</explicacion>\n" +
"          <pesos puntuadorA=\"2\" puntuadorB=\"3\" puntuadorC=\"1\"/>\n" +
"        </opcion>\n" +
"        <opcion id=\"B\">\n" +
"          <texto>No es mi culpa, tiene que llamar a soporte tecnico.</texto>\n" +
"          <explicacion>Respuesta evasiva. Genera mayor frustracion en el cliente.</explicacion>\n" +
"          <pesos puntuadorA=\"-1\" puntuadorB=\"-2\" puntuadorC=\"0\"/>\n" +
"        </opcion>\n" +
"      </opciones>\n" +
"    </dialogo>\n" +
"\n" +
"    <!-- Agrega mas dialogos aqui -->\n" +
"\n" +
"  </dialogos>\n" +
"\n" +
"  <!-- Mensaje final, siempre visible al terminar -->\n" +
"  <despedida>Gracias por participar. Revisa tus puntuaciones.</despedida>\n" +
"\n" +
"</juego>\n" +
"\n" +
"<!-- ====================== ALTERNATIVA CSV ====================== -->\n" +
"<!-- El CSV para conversaciones requiere varias tablas.\n" +
"     Usa una hoja por seccion:\n" +
"\n" +
"--- PUNTUADORES ---\n" +
"id,nombre,rango_min,rango_max,desenlace\n" +
"A,Confianza,0,5,Tu nivel de confianza es bajo.\n" +
"B,Empatia,6,10,Has conectado con el personaje.\n" +
"C,Liderazgo,0,10,Demostraste capacidad de liderazgo.\n" +
"\n" +
"--- DIALOGOS ---\n" +
"dialogo_num,prompt,opcion,texto,explicacion,peso_A,peso_B,peso_C\n" +
"1,El cliente llega furioso...,A,Entiendo su frustracion...,Respuesta empatica.,2,3,1\n" +
"1,El cliente llega furioso...,B,No es mi culpa...,Respuesta evasiva.,-1,-2,0\n" +
"\n" +
"--- DESPEDIDA ---\n" +
"Gracias por participar. Revisa tus puntuaciones.\n" +
"\n" +
"-->";
    }

    // ── Abrir fichero ────────────────────────────────────────────────────────

    private void openFile() {
        JFileChooser fc = new JFileChooser();
        fc.setDialogTitle("Abrir plantilla");
        fc.setFileFilter(new FileNameExtensionFilter("XML o CSV (*.xml, *.csv)", "xml","csv"));
        fc.setAcceptAllFileFilterUsed(false);
        if (fc.showOpenDialog(this) != JFileChooser.APPROVE_OPTION) return;

        File f = fc.getSelectedFile();
        try {
            String content = Files.readString(f.toPath(), StandardCharsets.UTF_8);
            textArea.setText(content);
            textArea.setCaretPosition(0);
            currentFilePath = f.getAbsolutePath();
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(this,
                "No se pudo leer el fichero:\n" + ex.getMessage(),
                "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    // ── Guardar fichero ──────────────────────────────────────────────────────

    private void saveFile() {
        JFileChooser fc = new JFileChooser();
        fc.setDialogTitle("Guardar plantilla");
        fc.addChoosableFileFilter(new FileNameExtensionFilter("XML (*.xml)", "xml"));
        fc.addChoosableFileFilter(new FileNameExtensionFilter("CSV (*.csv)", "csv"));
        fc.setFileFilter(new FileNameExtensionFilter("XML (*.xml)", "xml"));
        fc.setAcceptAllFileFilterUsed(false);

        if (currentFilePath != null)
            fc.setSelectedFile(new File(currentFilePath));

        if (fc.showSaveDialog(this) != JFileChooser.APPROVE_OPTION) return;

        File f = fc.getSelectedFile();
        String desc = fc.getFileFilter().getDescription();
        String ext  = desc.contains("CSV") ? ".csv" : ".xml";
        if (!f.getName().toLowerCase().endsWith(".xml") && !f.getName().toLowerCase().endsWith(".csv"))
            f = new File(f.getAbsolutePath() + ext);

        try {
            Files.writeString(f.toPath(), textArea.getText(), StandardCharsets.UTF_8);
            currentFilePath = f.getAbsolutePath();
            JOptionPane.showMessageDialog(this,
                "Fichero guardado correctamente:\n" + f.getAbsolutePath(),
                "Guardado", JOptionPane.PLAIN_MESSAGE);
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(this,
                "No se pudo guardar el fichero:\n" + ex.getMessage(),
                "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static String label(GameType t) {
        switch (t) {
            case TRUE_FALSE:   return "Verdadero y Falso";
            case MATCHING:     return "Unir Conceptos";
            case FILL_BLANK:   return "Rellenar Frases";
            case CONVERSATION: return "Conversacion";
            default:           return "";
        }
    }

    private JButton ghostBtn(String text) {
        JButton b = new JButton(text);
        b.setFont(F_SMALL);
        b.setForeground(FG_DIM);
        b.setContentAreaFilled(false); b.setBorderPainted(false); b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private JButton roundedBtn(String text, Color bg, Color bgHover, Color fg) {
        JButton b = new JButton(text) {
            boolean hov;
            {
                setOpaque(false); setContentAreaFilled(false);
                setBorderPainted(false); setFocusPainted(false);
                setFont(F_BTN);
                setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
                setPreferredSize(new Dimension(150, 36));
                addMouseListener(new MouseAdapter() {
                    public void mouseEntered(MouseEvent e) { hov=true;  repaint(); }
                    public void mouseExited (MouseEvent e) { hov=false; repaint(); }
                });
            }
            @Override protected void paintComponent(Graphics g) {
                setForeground(fg);
                Graphics2D g2 = aa(g);
                g2.setColor(hov ? bgHover : bg);
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),6,6));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        return b;
    }

    private void styleScrollBar(JScrollPane sp) {
        sp.getVerticalScrollBar().setPreferredSize(new Dimension(6,0));
        sp.getHorizontalScrollBar().setPreferredSize(new Dimension(0,6));
        sp.getVerticalScrollBar().setUI(new javax.swing.plaf.basic.BasicScrollBarUI() {
            @Override protected void configureScrollBarColors() {
                thumbColor = new Color(80,80,80); trackColor = BG_AREA;
            }
            @Override protected JButton createDecreaseButton(int o) { return zb(); }
            @Override protected JButton createIncreaseButton(int o) { return zb(); }
            private JButton zb() { JButton b = new JButton(); b.setPreferredSize(new Dimension(0,0)); return b; }
        });
        sp.getHorizontalScrollBar().setUI(new javax.swing.plaf.basic.BasicScrollBarUI() {
            @Override protected void configureScrollBarColors() {
                thumbColor = new Color(80,80,80); trackColor = BG_AREA;
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
