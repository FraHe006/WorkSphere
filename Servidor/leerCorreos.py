import sys
import json
import imaplib
import email
from email.header import decode_header
import os

# Configuración
sender = "helena.franz.folgueira@colexio-karbo.com"
app_password = "mdpd yqxc oghn efap"


def decodificar(valor):
    if not valor:
        return ""
    partes = decode_header(valor)
    resultado = ""
    for texto, codificacion in partes:
        if isinstance(texto, bytes):
            resultado += texto.decode(codificacion or "utf-8", errors="ignore")
        else:
            resultado += texto
    return resultado


def obtener_cuerpo(msg):
    if msg.is_multipart():
        for parte in msg.walk():
            if parte.get_content_type() == "text/plain" and not parte.get_filename():
                return parte.get_payload(decode=True).decode("utf-8", errors="ignore")
        for parte in msg.walk():
            if parte.get_content_type() == "text/html" and not parte.get_filename():
                return parte.get_payload(decode=True).decode("utf-8", errors="ignore")
        return ""
    else:
        return msg.get_payload(decode=True).decode("utf-8", errors="ignore")


try:
    # remitentes recibidos como JSON por argv: ["a@x.com", "b@y.com"]
    remitentes = json.loads(sys.argv[1])

    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(sender, app_password)
    mail.select("inbox")

    correos = []

    for remitente in remitentes:
        status, messages = mail.search(None, f'FROM "{remitente}"')
        if status != "OK":
            continue

        email_ids = messages[0].split()

        # últimos 20 por remitente
        for e_id in email_ids[-20:]:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for parte in msg_data:
                if isinstance(parte, tuple):
                    msg = email.message_from_bytes(parte[1])

                    correos.append({
                        "id": e_id.decode(),
                        "remitente": remitente,
                        "asunto": decodificar(msg["Subject"]) or "(Sin asunto)",
                        "fecha": msg.get("Date", ""),
                        "cuerpo": obtener_cuerpo(msg)
                    })

    mail.close()
    mail.logout()

    # Ordenar por fecha descendente (más reciente primero)
    from email.utils import parsedate_to_datetime

    def fecha_orden(c):
        try:
            return parsedate_to_datetime(c["fecha"])
        except Exception:
            return parsedate_to_datetime("Thu, 01 Jan 1970 00:00:00 +0000")

    correos.sort(key=fecha_orden, reverse=True)

    print(json.dumps({"success": True, "correos": correos}))

except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)