import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  comment: string;
  rating: number;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  currentYear = new Date().getFullYear();
  isMarqueePaused = signal(false);

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Support Lead',
      company: 'TechFlow Inc.',
      avatar: 'https://i.pravatar.cc/150?img=1',
      comment: 'FlashDesk transformed our support workflow. Response times dropped by 60% and customer satisfaction is at an all-time high!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Customer Success Manager',
      company: 'CloudBase',
      avatar: 'https://i.pravatar.cc/150?img=3',
      comment: 'The automation features are incredible. We handle 3x more tickets with the same team size.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      company: 'StartupHub',
      avatar: 'https://i.pravatar.cc/150?img=5',
      comment: 'Best decision we made for our support team. The interface is intuitive and the analytics are powerful.',
      rating: 4
    },
    {
      name: 'David Kim',
      role: 'CTO',
      company: 'InnovateLabs',
      avatar: 'https://i.pravatar.cc/150?img=8',
      comment: 'Seamless integration with our existing tools. Our team was productive from day one.',
      rating: 5
    }
  ];

  pauseMarquee() {
    this.isMarqueePaused.set(true);
  }

  resumeMarquee() {
    this.isMarqueePaused.set(false);
  }

  get duplicatedTestimonials(): Testimonial[] {
    return [...this.testimonials, ...this.testimonials];
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
