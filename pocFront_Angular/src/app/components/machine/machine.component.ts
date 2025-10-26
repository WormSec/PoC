import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine as MachineType } from '../../models/types';

@Component({
  selector: 'app-machine',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA], 
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss']
})
export class MachineComponent implements OnChanges {
  @Input() machine!: MachineType;
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Output() machineClick = new EventEmitter<void>();

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
      ? 'machine-circle-connected' 
      : 'machine-circle-isolated';
    this.textClass = this.machine.status === 'connected' 
      ? 'machine-text-connected' 
      : 'machine-text-isolated';
  }

  handleClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (target.classList.contains('dragging')) {
      target.classList.remove('dragging');
      return;
    }
    this.machineClick.emit();
  }

  getAnimationStyle(): string {
    if (this.isTransitioning) {
      return this.machine.status === 'connected'
        ? 'pulse-connected 0.5s ease 3'
        : 'pulse-isolated 0.5s ease 3';
    }
    return '';
  }

  ngOnDestroy(): void {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
  }
}