package org.example.Interfaz;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;

public class RoundedComponents {

    // ── Campo de texto ───────────────────────────────────────────────────────
    public static class RoundedField extends JTextField {
        private final String ph;
        private boolean focused;
        public RoundedField(String placeholder) {
            this.ph = placeholder;
            setOpaque(false);
            setFont(Theme.F_BODY);
            setBorder(BorderFactory.createEmptyBorder(8,12,8,12));
            addFocusListener(new FocusAdapter() {
                public void focusGained(FocusEvent e) { focused=true;  repaint(); }
                public void focusLost (FocusEvent e) { focused=false; repaint(); }
            });
        }
        @Override protected void paintComponent(Graphics g) {
            setForeground(Theme.textPrimary());
            setCaretColor(Theme.textPrimary());
            Graphics2D g2 = aa(g);
            g2.setColor(Theme.inputBg());
            g2.fill(rr(0,0,getWidth(),getHeight()));
            g2.setStroke(new BasicStroke(focused ? 1.8f : 1f));
            g2.setColor(focused ? Theme.borderFocus() : Theme.border());
            g2.draw(rr(1,1,getWidth()-2,getHeight()-2));
            super.paintComponent(g);
            if (getText().isEmpty() && !isFocusOwner()) {
                g2.setColor(Theme.textSecondary());
                g2.setFont(Theme.F_BODY);
                FontMetrics fm = g2.getFontMetrics();
                g2.drawString(ph, 12, (getHeight()+fm.getAscent()-fm.getDescent())/2);
            }
            g2.dispose();
        }
    }

    // ── Campo de contraseña ──────────────────────────────────────────────────
    public static class RoundedPasswordField extends JPasswordField {
        private final String ph;
        private boolean focused;
        public RoundedPasswordField(String placeholder) {
            this.ph = placeholder;
            setOpaque(false);
            setFont(Theme.F_BODY);
            setEchoChar('*');
            setBorder(BorderFactory.createEmptyBorder(8,12,8,12));
            addFocusListener(new FocusAdapter() {
                public void focusGained(FocusEvent e) { focused=true;  repaint(); }
                public void focusLost (FocusEvent e) { focused=false; repaint(); }
            });
        }
        @Override protected void paintComponent(Graphics g) {
            setForeground(Theme.textPrimary());
            setCaretColor(Theme.textPrimary());
            Graphics2D g2 = aa(g);
            g2.setColor(Theme.inputBg());
            g2.fill(rr(0,0,getWidth(),getHeight()));
            g2.setStroke(new BasicStroke(focused ? 1.8f : 1f));
            g2.setColor(focused ? Theme.borderFocus() : Theme.border());
            g2.draw(rr(1,1,getWidth()-2,getHeight()-2));
            super.paintComponent(g);
            if (getPassword().length == 0 && !isFocusOwner()) {
                g2.setColor(Theme.textSecondary());
                g2.setFont(Theme.F_BODY);
                FontMetrics fm = g2.getFontMetrics();
                g2.drawString(ph, 12, (getHeight()+fm.getAscent()-fm.getDescent())/2);
            }
            g2.dispose();
        }
    }

    // ── Botón primario ───────────────────────────────────────────────────────
    public static class PrimaryButton extends JButton {
        private boolean hovered;
        public PrimaryButton(String text) {
            super(text);
            setOpaque(false); setContentAreaFilled(false);
            setBorderPainted(false); setFocusPainted(false);
            setFont(Theme.F_BTN);
            setPreferredSize(new Dimension(0, Theme.BH));
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            addMouseListener(new MouseAdapter() {
                public void mouseEntered(MouseEvent e) { hovered=true;  repaint(); }
                public void mouseExited (MouseEvent e) { hovered=false; repaint(); }
            });
        }
        @Override protected void paintComponent(Graphics g) {
            setForeground(Theme.btnPrimFg());
            Graphics2D g2 = aa(g);
            g2.setColor(hovered ? Theme.btnPrimHover() : Theme.btnPrimBg());
            g2.fill(rr(0,0,getWidth(),getHeight()));
            g2.dispose();
            super.paintComponent(g);
        }
    }

    // ── Botón secundario ─────────────────────────────────────────────────────
    public static class SecondaryButton extends JButton {
        private boolean hovered;
        public SecondaryButton(String text) {
            super(text);
            setOpaque(false); setContentAreaFilled(false);
            setBorderPainted(false); setFocusPainted(false);
            setFont(Theme.F_BTN);
            setPreferredSize(new Dimension(0, Theme.BH));
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            addMouseListener(new MouseAdapter() {
                public void mouseEntered(MouseEvent e) { hovered=true;  repaint(); }
                public void mouseExited (MouseEvent e) { hovered=false; repaint(); }
            });
        }
        @Override protected void paintComponent(Graphics g) {
            setForeground(hovered ? Theme.btnSecHoverFg() : Theme.btnSecFg());
            Graphics2D g2 = aa(g);
            if (hovered) {
                g2.setColor(Theme.btnSecHoverBg());
                g2.fill(rr(0,0,getWidth(),getHeight()));
            }
            g2.setStroke(new BasicStroke(1.2f));
            g2.setColor(Theme.btnSecBorder());
            g2.draw(rr(0.6f,0.6f,getWidth()-1.2f,getHeight()-1.2f));
            g2.dispose();
            super.paintComponent(g);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    public static Graphics2D aa(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        return g2;
    }
    public static RoundRectangle2D.Float rr(float x, float y, float w, float h) {
        return new RoundRectangle2D.Float(x,y,w,h,Theme.R,Theme.R);
    }
}
