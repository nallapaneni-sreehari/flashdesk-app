import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoaderService } from './core/services/loader.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast, NgxSpinnerModule, ConfirmDialogComponent],
  templateUrl: './app.html',
})
export class App {
  loader = inject(LoaderService);
}
