import { Component, Input, OnChanges, SimpleChanges, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine } from '../../models/types';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnChanges {
  @Input() machine!: Machine;

  previousStatus: string = '';
  isTransitioning: boolean = false;
  circleClass: string = '';
  textClass: string = '';

  private transitionTimer?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['machine']) {
      this.updateClasses();
      
      if (this.previousStatus && this.previousStatus !== this.machine.status) {
        this.isTransitioning = true;
        
        if (this.transitionTimer) {
          clearTimeout(this.transitionTimer);
        }
        
        this.transitionTimer = window.setTimeout(() => {
          this.isTransitioning = false;
          this.previousStatus = this.machine.status;
        }, 1000);
      } else if (!this.previousStatus) {
        this.previousStatus = this.machine.status;
      }
    }
  }

  updateClasses(): void {
    this.circleClass = this.machine.status === 'connected'
      ? 'machine-circle-small-connected'
      : 'machine-circle-small-isolated';
    this.textClass = this.machine.status === 'connected'
      ? 'machine-text-small-connected'
      : 'machine-text-small-isolated';
  }

  getAnimationStyle(): string {
    if (this.isTransitioning) {
      return this.machine.status === 'connected'
        ? 'pulse-connected 0.5s ease 3'
        : 'pulse-isolated 0.5s ease 3';
    }
    return '';
  }

  getPaddedId(): string {
    return this.machine.id.padStart(7, 'x');
  }

  ngOnDestroy(): void {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
  }
}