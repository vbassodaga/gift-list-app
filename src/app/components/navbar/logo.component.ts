import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <svg 
      width="35" 
      height="35" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="logo-svg">
      <!-- Casa/Presente - Base simplificada -->
      <rect x="4" y="10" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
      
      <!-- Telhado da casa -->
      <path d="M3 10 L12 3 L21 10" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      
      <!-- Laço do presente - minimalista -->
      <rect x="10" y="2" width="4" height="2" rx="0.5" fill="currentColor"/>
      <rect x="11.5" y="1" width="1" height="4" rx="0.5" fill="currentColor"/>
      
      <!-- Lista dentro - linhas simples -->
      <line x1="6" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="6" y1="16" x2="9" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="6" y1="19" x2="8" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `,
  styles: [`
    .logo-svg {
      display: block;
      color: #6366f1;
      transition: color 0.3s ease;
    }
    
    .logo-svg:hover {
      color: #8b5cf6;
    }
  `]
})
export class LogoComponent {}
