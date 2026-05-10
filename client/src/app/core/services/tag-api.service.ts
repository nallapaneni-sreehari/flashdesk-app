import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface TagDto {
  id: string;
  name: string;
  ticketCount: number;
}

@Injectable({ providedIn: 'root' })
export class TagApiService {
  private api = inject(ApiService);

  getTags(): Observable<TagDto[]> {
    return this.api.get<TagDto[]>('/tags').pipe(map(res => res.data));
  }
}
