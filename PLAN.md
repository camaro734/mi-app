# Dosis — plan técnico

App de foco que **dosifica la dopamina barata**: filtra el consumo pasivo
(vídeo corto, feeds infinitos, scroll sin fin) que hace perder horas no
productivas, y deja pasar el uso con intención.

Este repositorio contiene, por ahora, el **prototipo de flujo (PWA en React)**:
toda la UI y la lógica de producto con **bloqueo simulado**. Sirve para validar
diseño y experiencia antes de invertir en la integración nativa.

---

## 1. La verdad técnica (por qué esto no puede ser solo una web)

Una PWA corre dentro del navegador y **no tiene permiso del sistema operativo
para ver ni cerrar otras apps**. Bloquear TikTok/Instagram de verdad exige
frameworks nativos del SO:

| Plataforma | Mecanismo | Notas |
|---|---|---|
| **iOS** | **Screen Time API**: `FamilyControls` (permiso + selección de apps), `ManagedSettings` (aplica el escudo), `DeviceActivity` (horarios/límites). | Único camino sancionado por Apple. Requiere el entitlement `com.apple.developer.family-controls` (se solicita a Apple). Los tokens de app son **opacos** (no sabes qué app es, por privacidad) y **no estables** entre actualizaciones. |
| **Android** | `UsageStatsManager` (leer uso), `AccessibilityService` (detectar app en primer plano + overlay/cierre), `SYSTEM_ALERT_WINDOW` (pantalla encima), VPN/DNS local (bloqueo de dominios). | Google restringe cada vez más el uso de accesibilidad (Permission Declaration Form; Android 17 bloquea apps que no sean herramientas de accesibilidad legítimas en Advanced Protection Mode). |

**Prioridad actual del proyecto: iOS** (bloqueo más fiable y conforme).

## 2. Arquitectura objetivo

Reutilizar esta UI React envolviéndola en una app nativa y añadiendo el puente
de bloqueo:

- **Capacitor** o **React Native** sobre el código React actual.
- Puente iOS a Screen Time. Referencia: `kingstinct/react-native-device-activity`
  expone directamente Screen Time / DeviceActivity / Shielding.
- Una **App Extension** (`DeviceActivityMonitor`) para que los límites y escudos
  se apliquen aunque la app principal esté cerrada.

```
React (UI, este repo)
  └── Capacitor / React Native
        ├── iOS:    FamilyControls · ManagedSettings · DeviceActivity (+ entitlement)
        └── Android: UsageStatsManager · AccessibilityService · Overlay
```

## 3. Qué PONER (incluido en el prototipo)

1. **Lista negra/blanca de apps** clasificadas por tipo de dopamina (`AppsManager`).
2. **Pantalla de fricción / intención** antes de abrir una app dosificada
   (`FrictionScreen`) — mecánica central; ~30% menos aperturas según *one sec*.
3. **Modo Foco** con temporizador que escuda todo lo dosificado (`Focus`).
4. **Objetivo diario** y pausa de fricción configurables (`SettingsScreen`).
5. **Panel de datos honesto**: uso por categoría, semana, top apps (`Insights`).

## 4. Qué QUITAR (decisiones de diseño anti-dopamina)

- ❌ Gamificación adictiva (puntos, cofres, animaciones celebratorias): sería
  dopamina barata dentro de la propia app.
- ❌ Notificaciones frecuentes: contradicen el objetivo.
- ❌ Feeds sociales / rankings internos.
- ❌ Bloqueos 100% inescapables: generan ansiedad y desinstalación. Mejor
  **fricción + coste**, no cárcel.
- Paleta visual deliberadamente apagada y oscura para no sobreestimular.

## 5. Roadmap

- [x] **Fase 0** — Prototipo PWA del flujo (este repo): bloqueo simulado.
- [ ] **Fase 1** — Envolver en Capacitor/React Native.
- [ ] **Fase 2 (iOS)** — Solicitar entitlement + integrar Screen Time → bloqueo real.
- [ ] **Fase 3 (Android)** — UsageStatsManager + servicio de overlay declarado.

## 6. Desarrollo

```bash
npm install
npm run dev      # arranca el prototipo
npm run build    # compila a dist/
```

> El bloqueo mostrado en Fase 0 es **simulado**. El bloqueo efectivo lo aplica
> siempre el sistema operativo a partir de la Fase 2.
