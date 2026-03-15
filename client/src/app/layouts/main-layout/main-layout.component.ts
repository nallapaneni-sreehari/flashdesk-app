import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';
import { KeyboardShortcutService } from '../../core/services/keyboard-shortcut.service';
import { KeyboardShortcutHelpComponent } from '../../shared/components/keyboard-shortcut-help/keyboard-shortcut-help.component';
import { routeAnimation } from '../../shared/animations/route.animation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, GlobalSearchComponent, KeyboardShortcutHelpComponent],
  templateUrl: './main-layout.component.html',
  animations: [routeAnimation],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private shortcutService = inject(KeyboardShortcutService);
  private contexts = inject(ChildrenOutletContexts);
  private helpSub!: Subscription;

  sidebarCollapsed = signal(true);
  showShortcutHelp = signal(false);
  showAnnouncement = signal(true);
  announcementDismissed = signal(false);
  announcementMessage = '🎉 Welcome to Flashdesk! Sample data has been loaded for demo purposes. Click here to remove it and start fresh.';
  currentYear = new Date().getFullYear();

  ngOnInit() {
    // Register sidebar toggle with the shortcut service
    const sidebarShortcut = this.shortcutService.getShortcuts().find(s => s.keys[0] === 'm' && s.keys.length === 1);
    if (sidebarShortcut) {
      sidebarShortcut.action = () => this.toggleSidebar();
    }

    this.helpSub = this.shortcutService.showHelp$.subscribe(() => {
      this.showShortcutHelp.update(v => !v);
    });
  }

  ngOnDestroy() {
    this.helpSub?.unsubscribe();
  }

  dismissAnnouncement() {
    this.announcementDismissed.set(true);
    setTimeout(() => this.showAnnouncement.set(false), 500);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url.toString() ?? '';
  }
}
