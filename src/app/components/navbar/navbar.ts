import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { AuthService } from '../../core/services/auth.service';
import { LoginModalComponent } from '../login-modal/login-modal';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, HlmButton, LoginModalComponent],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly loginModalOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
  }
}
