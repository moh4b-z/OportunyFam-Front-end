'use client'

import { useThemeControl } from '@/hooks/useThemeControl'

/**
 * Componente para controlar o tema da aplicação
 * Deve ser usado no layout para funcionar em toda a aplicação
 */
export default function ThemeController() {
  useThemeControl()
  return null // Componente invisível, apenas executa a lógica
}
