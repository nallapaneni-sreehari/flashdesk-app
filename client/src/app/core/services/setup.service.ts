import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface SetupCheckResponse {
  isSetupComplete: boolean;
  workspace?: {
    id: string;
    name: string;
  };
}

export interface SetupPayload {
  workspaceName: string;
  slug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface SetupResponse {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SetupService {
  private api = inject(ApiService);

  private _isSetupComplete = signal<boolean | null>(null);
  readonly isSetupComplete = this._isSetupComplete.asReadonly();

  async checkSetup(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.api.get<SetupCheckResponse>('/setup/check')
      );
      const complete = res.data.isSetupComplete;
      this._isSetupComplete.set(complete);
      return complete;
    } catch {
      this._isSetupComplete.set(false);
      return false;
    }
  }

  async createWorkspace(payload: SetupPayload): Promise<SetupResponse> {
    const res = await firstValueFrom(
      this.api.post<SetupResponse>('/setup', payload)
    );
    this._isSetupComplete.set(true);
    return res.data;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 48);
  }
}
