'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook para controlar o tema baseado na rota atual
 * Força tema claro na página de login
 */
export function useThemeControl() {
  const pathname = usePathname()

  useEffect(() => {
    // Se estiver na página de login, sempre forçar tema claro
    if (pathname === '/login') {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
      return
    }

    // Para outras páginas, aplicar tema salvo
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
  }, [pathname])
}
