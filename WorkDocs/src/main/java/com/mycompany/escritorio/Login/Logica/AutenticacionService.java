package org.example.Login.Logica;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class AutenticacionService {

    // Puerto definido en tu servidor.js
    private static final String BASE_URL = "http://dam2.colexio-karbo.com:6101";

    // ✅ IMPORTANTE: Crear HttpClient CON gestor de cookies
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
            .followRedirects(HttpClient.Redirect.ALWAYS)  // Seguir redirects si los hay
            .build();

    /**
     * Login: POST /api/usuarios/login
     */
    public static boolean login(String email, String password) {
        try {
            String jsonBody = String.format(
                    "{\"email\":\"%s\", \"password\":\"%s\"}",
                    escapeJson(email),
                    escapeJson(password)
            );

            System.out.println("🔍 [LOGIN] Enviando petición a: " + BASE_URL + "/api/usuarios/login");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/api/usuarios/login"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")  // ← AÑADIDO
                    .header("User-Agent", "JavaClient/1.0")  // ← AÑADIDO
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("📡 [LOGIN] Status: " + response.statusCode());
            System.out.println("📄 [LOGIN] Response: " + response.body());

            // El controller devuelve 200 OK si es exitoso
            boolean success = response.statusCode() == 200;

            if (success) {
                System.out.println("✅ [LOGIN] Sesión iniciada correctamente");
            } else {
                System.out.println("❌ [LOGIN] Credenciales inválidas (Status: " + response.statusCode() + ")");
            }

            return success;

        } catch (java.net.http.HttpTimeoutException e) {
            System.err.println("❌ [LOGIN] TIMEOUT: El servidor tardó demasiado en responder");
            System.err.println("    Verifica que el servidor está ejecutándose y es accesible");
            e.printStackTrace();
            return false;
        } catch (java.net.ConnectException e) {
            System.err.println("❌ [LOGIN] ERROR DE CONEXIÓN: No se puede conectar a " + BASE_URL);
            System.err.println("    Verifica que:");
            System.err.println("    - El servidor Node.js está corriendo");
            System.err.println("    - La URL y puerto (6101) son correctos");
            System.err.println("    - No hay firewall bloqueando la conexión");
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("❌ [LOGIN] ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Registro: POST /api/usuarios
     * El controller crearUsuario espera: nombre, email, password
     */
    public static boolean register(String nombre, String email, String password) {
        try {
            String jsonBody = String.format(
                    "{\"nombre\":\"%s\", \"email\":\"%s\", \"password\":\"%s\"}",
                    escapeJson(nombre),
                    escapeJson(email),
                    escapeJson(password)
            );

            System.out.println("🔍 [REGISTRO] Enviando petición a: " + BASE_URL + "/api/usuarios");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/api/usuarios"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")  // ← AÑADIDO
                    .header("User-Agent", "JavaClient/1.0")  // ← AÑADIDO
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("📡 [REGISTRO] Status: " + response.statusCode());
            System.out.println("📄 [REGISTRO] Response: " + response.body());

            // El controller devuelve 201 Created si es exitoso
            boolean success = response.statusCode() == 201;

            if (success) {
                System.out.println("✅ [REGISTRO] Cuenta creada correctamente");
            } else {
                System.out.println("❌ [REGISTRO] Error al registrar (Status: " + response.statusCode() + ")");
            }

            return success;

        } catch (java.net.http.HttpTimeoutException e) {
            System.err.println("❌ [REGISTRO] TIMEOUT: El servidor tardó demasiado en responder");
            System.err.println("    Verifica que el servidor está ejecutándose y es accesible");
            e.printStackTrace();
            return false;
        } catch (java.net.ConnectException e) {
            System.err.println("❌ [REGISTRO] ERROR DE CONEXIÓN: No se puede conectar a " + BASE_URL);
            System.err.println("    Verifica que:");
            System.err.println("    - El servidor Node.js está corriendo");
            System.err.println("    - La URL y puerto (6101) son correctos");
            System.err.println("    - No hay firewall bloqueando la conexión");
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("❌ [REGISTRO] ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Escapar caracteres especiales en JSON
     * Importante para evitar inyección JSON
     */
    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")     // \ → \\
                .replace("\"", "\\\"")     // " → \"
                .replace("\n", "\\n")      // newline → \n
                .replace("\r", "\\r")      // carriage return → \r
                .replace("\t", "\\t");     // tab → \t
    }
}