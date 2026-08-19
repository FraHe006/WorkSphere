package org.example.Interfaz;

import org.example.Interfaz.RoundedComponents.*;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;

/** Ventana genérica que se abre al pulsar una tarjeta del menú */
public class ModuleWindow extends JFrame {

    public ModuleWindow(String moduleName, JFrame parent) {
        super("Demo — " + moduleName);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setUndecorated(true);
        setBackground(new Color(0,0,0,0));
        setSize(560, 340);
        setLocationRelativeTo(parent);
        setShape(new RoundRectangle2D.Double(0,0,560,340,12,12));
        buildUI(moduleName);
        addDragSupport();
    }

    private void buildUI(String moduleName) {
        JPanel root = new JPanel(new BorderLayout()) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bg());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),12,12));
                g2.setStroke(new BasicStroke(1f));
                g2.setColor(Theme.border());
                g2.draw(new RoundRectangle2D.Float(0.5f,0.5f,getWidth()-1,getHeight()-1,12,12));
                g2.dispose();
            }
        };
        root.setOpaque(false);
        setContentPane(root);

        // Barra superior
        JPanel bar = new JPanel(new BorderLayout());
        bar.setOpaque(false);
        bar.setBorder(BorderFactory.createEmptyBorder(12,18,0,18));

        JLabel title = new JLabel("Demo  /  " + moduleName);
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

        JSeparator sep = new JSeparator();
        sep.setForeground(Theme.border());
        JPanel sepWrap = new JPanel(new BorderLayout());
        sepWrap.setOpaque(false);
        sepWrap.setBorder(BorderFactory.createEmptyBorder(10,0,0,0));
        sepWrap.add(sep);

        JPanel topWrap = new JPanel(new BorderLayout());
        topWrap.setOpaque(false);
        topWrap.add(bar,     BorderLayout.CENTER);
        topWrap.add(sepWrap, BorderLayout.SOUTH);

        // Contenido central
        JPanel body = new JPanel(new GridBagLayout());
        body.setOpaque(false);

        JPanel inner = new JPanel();
        inner.setLayout(new BoxLayout(inner, BoxLayout.Y_AXIS));
        inner.setOpaque(false);

        JLabel nameLbl = new JLabel("Modulo: " + moduleName);
        nameLbl.setFont(Theme.F_TITLE);
        nameLbl.setForeground(Theme.textPrimary());
        nameLbl.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel infoLbl = new JLabel("La ventana de " + moduleName + " se ha abierto correctamente.");
        infoLbl.setFont(Theme.F_BODY);
        infoLbl.setForeground(Theme.textSecondary());
        infoLbl.setAlignmentX(Component.CENTER_ALIGNMENT);

        JSeparator div = new JSeparator();
        div.setForeground(Theme.border());
        div.setMaximumSize(new Dimension(360, 1));
        div.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel hint = new JLabel("Contenido en desarrollo.");
        hint.setFont(Theme.F_SMALL);
        hint.setForeground(Theme.textSecondary());
        hint.setAlignmentX(Component.CENTER_ALIGNMENT);

        SecondaryButton closeSecBtn = new SecondaryButton("Cerrar ventana");
        closeSecBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        closeSecBtn.setMaximumSize(new Dimension(160, Theme.BH));
        closeSecBtn.addActionListener(e -> dispose());

        inner.add(nameLbl);
        inner.add(Box.createVerticalStrut(10));
        inner.add(infoLbl);
        inner.add(Box.createVerticalStrut(20));
        inner.add(div);
        inner.add(Box.createVerticalStrut(16));
        inner.add(hint);
        inner.add(Box.createVerticalStrut(24));
        inner.add(closeSecBtn);

        body.add(inner);

        root.add(topWrap, BorderLayout.NORTH);
        root.add(body,    BorderLayout.CENTER);
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
