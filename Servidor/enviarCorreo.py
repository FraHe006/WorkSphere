import sys
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

try:
    # Parsear datos recibidos desde Node.js (sys.argv[1])
    datos = json.loads(sys.argv[1])
    
    destinatario = datos["destinatario"]
    asunto = datos["asunto"]
    cuerpo = datos["cuerpo"]
    
    # Configuración del correo
    sender = "helena.franz.folgueira@colexio-karbo.com"
    app_password = "mdpd yqxc oghn efap"
    
    # Crear mensaje
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = destinatario
    msg["Subject"] = asunto
    msg.attach(MIMEText(cuerpo, "plain"))
    
    # Enviar correo
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, app_password)
        server.send_message(msg)
    
    # Respuesta en JSON para que Node.js pueda parsearla
    print(json.dumps({
        "success": True, 
        "message": f"Correo enviado a {destinatario}"
    }))

except Exception as e:
    print(json.dumps({
        "success": False, 
        "error": str(e)
    }))
    sys.exit(1)