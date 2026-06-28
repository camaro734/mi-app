// Servicio mínimo para enviar los resúmenes de reunión por correo.
// Ejecuta:  npm install express nodemailer  &&  node server.js
import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json({ limit: "1mb" }));

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  FROM_EMAIL, SHARED_TOKEN, PORT = 3000,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// Autorización por token compartido con la app.
app.use((req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!SHARED_TOKEN || token !== SHARED_TOKEN) {
    return res.status(401).json({ error: "no autorizado" });
  }
  next();
});

app.post("/send-summary", async (req, res) => {
  const { to, subject, body } = req.body || {};
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "faltan campos" });
  }
  try {
    await transporter.sendMail({ from: FROM_EMAIL, to, subject, text: body });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "no se pudo enviar" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Atlas backend escuchando en :${PORT}`));
