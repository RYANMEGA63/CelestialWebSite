import { create } from 'zustand'

export interface UIState {
  isWizardOpen: boolean
  selectedOffer: any | null
  openWizard: (offer?: any) => void
  closeWizard: () => void
  
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  setMobileMenuOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isWizardOpen: false,
  selectedOffer: null,
  openWizard: (offer = null) => set({ isWizardOpen: true, selectedOffer: offer, isMobileMenuOpen: false }),
  closeWizard: () => set({ isWizardOpen: false, selectedOffer: null }),

  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen })
}))
