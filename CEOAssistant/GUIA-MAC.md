# Guía rápida — montar Atlas desde el Mac con la app de escritorio de Claude Code

Esto es lo mínimo que haces **tú**. El resto te lo hago yo desde el chat.

---

## Paso 0 · Antes de empezar (una vez)

Necesitas dos cosas instaladas en el Mac (si ya las tienes, salta al Paso 1):

- **Xcode** — desde la App Store (gratis). Ábrelo una vez para que termine de instalarse.
- **Homebrew** — pega en la Terminal la línea de https://brew.sh

> No hace falta cuenta de desarrollador de pago para probar en el **simulador**.
> Sólo la necesitas (gratis con tu Apple ID, o de pago para la Store) cuando
> quieras instalarlo en tu Apple Watch **físico**.

---

## Paso 1 · Abre el proyecto en la app de escritorio de Claude Code

1. Abre la **app de Claude Code** en el Mac.
2. Elige **abrir esta carpeta del proyecto** (la del repo `mi-app`).
3. Asegúrate de estar en la rama `claude/apple-watch-ai-ceo-assistant-az3goh`
   (si no, dímelo y te ayudo a cambiar a ella).

A partir de aquí ya trabajo sobre tu Mac de verdad.

---

## Paso 2 · Dile esto al chat (yo hago el trabajo)

Copia y pega cualquiera de estas frases:

- **"Ejecuta el setup y compila la app en el simulador"** → instalo XcodeGen,
  genero el proyecto, compilo y arreglo lo que haga falta.
- **"Pruébalo en el simulador de iPhone y Apple Watch"** → lo lanzo y te digo
  qué se ve.

> También puedes lanzar tú el arranque a mano:
> ```bash
> cd CEOAssistant
> chmod +x setup.sh && ./setup.sh
> ```

---

## Paso 3 · Lo que sí tienes que tocar tú (rápido)

1. **API key de Anthropic** — la pegas en la app, en *Ajustes* (cuando corra en
   el simulador). Es tu secreto; mejor lo pones tú. La sacas en
   https://console.anthropic.com
2. **Tu correo** para los resúmenes — también en *Ajustes*.
3. **Apple ID en Xcode** (sólo si vas a usar el reloj real) →
   *Xcode › Settings › Accounts › +*. Login con tu cuenta y 2FA.
4. **Permisos en el dispositivo** (micrófono, calendario) — un toque de
   "Permitir" la primera vez.

---

## Paso 4 · Iterar

Cuando esté corriendo, me vas pidiendo cambios en lenguaje normal:
"haz el botón de grabar más grande", "añade la complicación de esfera",
"cambia el tono del asesor", "arregla este error: …".

Yo edito el código, recompilo y lo vuelvo a probar.

---

### Resumen de quién hace qué

| Tarea | Quién |
|---|---|
| Instalar XcodeGen, generar y compilar el proyecto | **Yo** |
| Arreglar errores de compilación | **Yo** |
| Lanzar en el simulador y revisar | **Yo** |
| Cambios de código, diseño y funciones | **Yo** |
| Instalar Xcode y Homebrew (una vez) | Tú |
| Login con tu Apple ID | Tú |
| Pegar las API keys y tu correo | Tú |
| Aceptar permisos en el dispositivo / publicar en la Store | Tú |
