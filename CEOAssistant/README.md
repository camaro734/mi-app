# Atlas — Asistente de IA para CEO (Apple Watch + iPhone)

Asistente ejecutivo "todo terreno" para Apple Watch con app companion de iPhone.
Pensado para un CEO: graba reuniones y te las resume al correo, te avisa de tus
citas, te aconseja sobre decisiones de negocio y captura notas por voz desde la
muñeca.

> **Estado:** proyecto nativo completo en SwiftUI listo para abrir en Xcode.
> Se genera con XcodeGen y se compila/ejecuta en un Mac con Xcode 15+ (no se
> puede compilar en Linux). Todo el código de la app está escrito; sólo falta
> abrirlo, poner tu Apple Team ID y tus API keys, y darle a *Run*.

---

## ✨ Funciones (v1)

| Función | Watch | iPhone |
|---|:---:|:---:|
| **Grabar reunión → transcribir → resumen ejecutivo al correo** | ✅ graba y envía al iPhone | ✅ transcribe, resume y envía |
| **Asesor de CEO** (chat de estrategia/finanzas/operaciones) | ✅ por dictado, responde el iPhone | ✅ chat completo |
| **Calendario y avisos de citas** | ✅ próxima cita | ✅ agenda + notificaciones |
| **Briefing diario** (saludo, agenda, 3 prioridades, acciones abiertas) | — | ✅ |
| **Dictado de notas/tareas** (la IA las limpia y clasifica) | ✅ | ✅ |

El resumen de cada reunión no es un texto plano: la IA devuelve **titular,
resumen ejecutivo, decisiones, acciones (con responsable y plazo), riesgos y
seguimientos** — formato pensado para decidir, no para leer.

**Además incluye:**
- 🗣️ **Atajos de Siri** (App Intents): *"Oye Siri, pregunta a Atlas…"*,
  *"…resume mi última reunión"*, *"…graba una reunión"*, *"…dame mi briefing"*.
  Atlas responde por voz sin abrir la app.
- ⌚ **Complicación de esfera** (WidgetKit): tu próxima cita de un vistazo, en
  varios tamaños de complicación (circular, rectangular, esquina, en línea).

---

## 🏗️ Arquitectura

```
┌──────────────┐   audio (WatchConnectivity)   ┌──────────────┐
│  Apple Watch │ ────────────────────────────▶ │   iPhone     │
│  (capturar)  │ ◀──────────────────────────── │ (procesar)   │
└──────────────┘   respuesta del asesor         └──────┬───────┘
                                                        │ HTTPS
                                          ┌─────────────┴─────────────┐
                                          │  Claude (Anthropic) API   │  ← resúmenes, asesor, briefing
                                          │  Apple Speech / Whisper   │  ← transcripción
                                          │  EventKit (calendario)    │
                                          │  Mail / Backend SMTP      │  ← envío de resúmenes
                                          └───────────────────────────┘
```

- **Watch = captura y vistazo.** Graba, dicta y muestra la próxima cita. El
  trabajo pesado lo hace el iPhone (tiene la API key y más batería/red).
- **iPhone = cerebro.** Transcribe, llama a la IA, gestiona calendario y correo.
- **Claude Opus 4.8** para razonamiento ejecutivo (configurable a Sonnet).
- **Transcripción:** Apple Speech **en el dispositivo** (privada, gratis) o
  **Whisper** (OpenAI) si prefieres máxima precisión.

### Estructura de carpetas

```
CEOAssistant/
├── project.yml              # spec de XcodeGen (genera el .xcodeproj)
├── Shared/                  # código compartido iOS + watchOS
│   ├── Models/              # Recording, MeetingSummary, Appointment, ...
│   ├── Services/            # AIService (Claude), Transcription, Calendar,
│   │                        # AudioRecorder, WatchConnectivity, AssistantStore
│   ├── Prompts/             # personalidad y prompts del asistente
│   ├── Intents/             # App Intents (atajos de Siri)
│   └── Utils/               # configuración
├── iOS/                     # app de iPhone (SwiftUI)
│   └── Views/               # Briefing, Reuniones, Asesor, Agenda, Ajustes...
├── WatchApp/                # app de Apple Watch (SwiftUI)
│   └── Views/               # Grabar, Asesor, Dictar, Próxima cita
├── WatchWidgets/            # complicación de esfera (WidgetKit)
└── Backend/                 # (opcional) envío automático de correos por SMTP
```

---

## 🚀 Puesta en marcha

### 1. Generar el proyecto Xcode

En un Mac con [Homebrew](https://brew.sh):

```bash
brew install xcodegen
cd CEOAssistant
xcodegen generate          # crea CEOAssistant.xcodeproj
open CEOAssistant.xcodeproj
```

> ¿Prefieres no usar XcodeGen? Crea un proyecto vacío "iOS App + Watch App" en
> Xcode y arrastra las carpetas `Shared`, `iOS` y `WatchApp` a sus targets. El
> `project.yml` documenta exactamente qué va en cada target.

### 2. Firmar

En *Signing & Capabilities* de cada target, selecciona tu equipo (o pon tu
`DEVELOPMENT_TEAM` en `project.yml` y regenera). Bundle IDs por defecto:

- iOS: `com.cmghidraulica.ceoassistant`
- Watch: `com.cmghidraulica.ceoassistant.watchkitapp`

### 3. Configurar claves (en la app, no en el código)

Abre la app en el iPhone → **Ajustes**:

1. Pega tu **API key de Anthropic** (https://console.anthropic.com).
2. (Opcional) Elige Whisper y pega tu **API key de OpenAI**.
3. Pon tu **nombre** y el **correo** donde quieres recibir los resúmenes.

Las claves se guardan **cifradas en el Keychain**, nunca en código ni en la nube.

### 4. Probar el flujo

1. **Reuniones → botón rojo** para grabar (o grábala desde el Watch).
2. Al parar, el iPhone transcribe y resume; abre el detalle y pulsa el sobre
   ✉️ para enviarte el resumen por correo.
3. **Asesor** → pregunta algo de negocio.
4. **Agenda** → concede acceso al calendario; verás citas y recibirás avisos.
5. **Hoy** → *Generar briefing*.

---

## 🔐 Privacidad

- Las grabaciones y transcripciones se quedan en tu dispositivo.
- Con transcripción **Apple en el dispositivo**, el audio no sale del teléfono;
  sólo el **texto** del resumen viaja a la IA.
- Las API keys viven en el Keychain. El backend de correo (opcional) guarda sus
  secretos como variables de entorno, fuera de la app.

---

## 🗺️ Ideas para siguientes versiones

- ✅ ~~Complicación en la esfera del Watch con la próxima cita.~~ (hecho)
- ✅ ~~Siri Shortcuts: "Oye Siri, resume mi última reunión".~~ (hecho)
- **Live Activity / Dynamic Island** mientras se graba o procesa.
- Envío automático de resúmenes vía backend (carpeta `Backend/`).
- Crear eventos de seguimiento en el calendario directamente desde una acción.
- Memoria del asesor: que conozca tus KPIs y el contexto de CMG Hidráulica.
- Integración con tu ERP/CRM para datos reales en el briefing.
- Soporte multi-idioma y resúmenes en HTML enriquecido.

---

## ⚠️ Notas técnicas

- Requiere **iOS 17+ / watchOS 10+** (EventKit full-access, async/await).
- `MFMailComposeViewController` necesita una cuenta de correo configurada en el
  iPhone; si no, usa el backend de la carpeta `Backend/`.
- El modelo por defecto (`claude-opus-4-8`) se cambia en `Shared/Utils/AppConfig.swift`.
- Este código no se ha compilado en este entorno (Linux); compílalo en Xcode y
  ajusta lo que tu versión de SDK requiera.
