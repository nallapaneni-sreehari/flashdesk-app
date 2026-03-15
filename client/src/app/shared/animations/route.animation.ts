import { trigger, transition, style, animate, query } from '@angular/animations';

export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    // Instantly hide leaving page
    query(':leave', [
      animate('0ms', style({ display: 'none' })),
    ], { optional: true }),

    // Fade in entering page from blur
    query(':enter', [
      style({ opacity: 0, filter: 'blur(4px)' }),
      animate('300ms ease-out', style({ opacity: 1, filter: 'blur(0)' })),
    ], { optional: true }),
  ]),
]);
