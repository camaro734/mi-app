# Backend opcional — envío automático de resúmenes

La app puede enviar los resúmenes por correo de dos formas:

1. **Sin backend (por defecto):** usa `MFMailComposeViewController` en el iPhone.
   El usuario confirma el envío con un toque. No requiere servidor ni secretos.

2. **Automático (este backend):** un pequeño servicio recibe el resumen y lo
   envía por SMTP/SendGrid sin interacción. Útil si quieres que los resúmenes
   salgan solos en cuanto la reunión termina.

`server.js` es un ejemplo mínimo con Express + Nodemailer. Despliégalo donde
quieras (Render, Fly.io, un VPS, Cloud Run…) y mete su URL en la app.

> Nunca pongas claves SMTP ni de API dentro de la app iOS. Vive en el backend
> como variables de entorno.

## Variables de entorno

```
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=contraseña
FROM_EMAIL=atlas@cmghidraulica.com
SHARED_TOKEN=un-token-secreto-largo   # la app lo envía en la cabecera Authorization
```

## Endpoint

`POST /send-summary`  con cuerpo JSON `{ "to", "subject", "body" }` y cabecera
`Authorization: Bearer <SHARED_TOKEN>`.
