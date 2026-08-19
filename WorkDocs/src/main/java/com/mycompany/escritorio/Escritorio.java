/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.escritorio;

import javax.swing.SwingUtilities;

/**
 *
 * @author hefra
 */
public class Escritorio {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            SplashScreen splash = new SplashScreen();
            splash.showAndLoad();
        });
    }
}
