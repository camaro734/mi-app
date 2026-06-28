#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Atlas — arranque en Mac.
# Instala lo necesario, genera el proyecto Xcode y lo abre.
# Uso:   cd CEOAssistant && ./setup.sh
# (si da "permiso denegado":  chmod +x setup.sh  y vuelve a ejecutarlo)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")"
echo "▶︎ Atlas — preparando el proyecto…"

# 1) Herramientas de línea de comandos de Xcode -------------------------------
if ! xcode-select -p >/dev/null 2>&1; then
  echo "⚠︎  Faltan las Command Line Tools de Xcode. Lanzo el instalador…"
  echo "   Acepta la ventana que aparece y vuelve a ejecutar ./setup.sh al terminar."
  xcode-select --install || true
  exit 1
fi

# 2) Homebrew ------------------------------------------------------------------
if ! command -v brew >/dev/null 2>&1; then
  echo "⚠︎  No tienes Homebrew. Instálalo desde https://brew.sh y vuelve a ejecutar."
  echo "   (Es una sola línea que copias en la Terminal.)"
  exit 1
fi

# 3) XcodeGen ------------------------------------------------------------------
if ! command -v xcodegen >/dev/null 2>&1; then
  echo "▶︎ Instalando XcodeGen…"
  brew install xcodegen
else
  echo "✓ XcodeGen ya instalado."
fi

# 4) Generar el proyecto -------------------------------------------------------
echo "▶︎ Generando CEOAssistant.xcodeproj…"
xcodegen generate

# 5) Abrir en Xcode ------------------------------------------------------------
echo "▶︎ Abriendo Xcode…"
open CEOAssistant.xcodeproj

cat <<'DONE'

✅ Listo. Xcode se está abriendo con el proyecto.

Siguientes pasos (te guío yo desde aquí):
  1. En Xcode, arriba, elige el target "CEOAssistant" y un simulador de iPhone.
  2. Pulsa ▶ (Run) — o dime "compila y pruébalo" y lo hago yo por ti.
  3. Cuando quieras llevarlo a tu Apple Watch real, inicia sesión con tu Apple ID
     en Xcode › Settings › Accounts (eso lo haces tú, es tu cuenta).

Si algo falla al compilar, pégame el error o dime "arregla los errores de build".
DONE
