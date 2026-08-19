package org.example;

import org.example.Interfaz.Theme;
import org.example.Login.Interfaz.LoginScreen;

import javax.swing.*;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;

public class SplashScreen extends JWindow {

    private JProgressBar bar;
    private JLabel       statusLbl;
    private int          progress = 0;

    private final String[] msgs = {
        "Iniciando aplicacion...",
        "Cargando modulos...",
        "Verificando configuracion...",
        "Conectando servicios...",
        "Preparando interfaz...",
        "Listo."
    };

    public SplashScreen() {
        setBackground(new Color(0,0,0,0));
        Dimension sc = Toolkit.getDefaultToolkit().getScreenSize();
        setSize((int)(sc.width*0.80), (int)(sc.height*0.80));
        setLocationRelativeTo(null);
        buildUI();
    }

    private void buildUI() {
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

        // Centro
        JPanel mid = new JPanel(new GridBagLayout());
        mid.setOpaque(false);
        JPanel brand = new JPanel();
        brand.setLayout(new BoxLayout(brand, BoxLayout.Y_AXIS));
        brand.setOpaque(false);

        JLabel name = new JLabel("DEMO");
        name.setFont(Theme.F_APP);
        name.setForeground(Theme.textPrimary());
        name.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel sub = new JLabel("Sistema de gestion v1.0");
        sub.setFont(Theme.F_BODY);
        sub.setForeground(Theme.textSecondary());
        sub.setAlignmentX(Component.CENTER_ALIGNMENT);

        brand.add(name);
        brand.add(Box.createVerticalStrut(10));
        brand.add(sub);
        mid.add(brand);

        // Inferior
        JPanel bottom = new JPanel(new BorderLayout(0,8));
        bottom.setOpaque(false);
        bottom.setBorder(BorderFactory.createEmptyBorder(0,50,30,50));

        statusLbl = new JLabel(msgs[0]);
        statusLbl.setFont(Theme.F_SMALL);
        statusLbl.setForeground(Theme.textSecondary());

        bar = new JProgressBar(0,100) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = aa(g);
                g2.setColor(Theme.bgSide());
                g2.fill(new RoundRectangle2D.Float(0,0,getWidth(),getHeight(),4,4));
                float pct = (float)getValue()/getMaximum();
                int fw = (int)(getWidth()*pct);
                if (fw > 0) {
                    g2.setColor(Theme.textSecondary());
                    g2.fill(new RoundRectangle2D.Float(0,0,fw,getHeight(),4,4));
                }
                g2.dispose();
            }
        };
        bar.setPreferredSize(new Dimension(0,6));
        bar.setBorderPainted(false);
        bar.setOpaque(false);

        bottom.add(statusLbl, BorderLayout.NORTH);
        bottom.add(bar,       BorderLayout.CENTER);

        root.add(mid,    BorderLayout.CENTER);
        root.add(bottom, BorderLayout.SOUTH);
        setContentPane(root);
    }

    public void showAndLoad() {
        setVisible(true);
        Timer t = new Timer(30, null);
        t.addActionListener(e -> {
            progress++;
            bar.setValue(progress);
            statusLbl.setText(msgs[Math.min(progress/18, msgs.length-1)]);
            if (progress >= 100) {
                t.stop();
                new Timer(300, ev -> {
                    ((Timer)ev.getSource()).stop();
                    dispose();
                    new LoginScreen().setVisible(true);
                }).start();
            }
        });
        t.start();
    }

    private static Graphics2D aa(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        return g2;
    }
}
