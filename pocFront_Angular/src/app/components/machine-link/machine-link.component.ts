import { Component, Input, OnChanges, SimpleChanges, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-link',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './machine-link.component.html',
  styleUrls: ['./machine-link.component.scss']
})
export class MachineLinkComponent implements OnChanges {
  @Input() sourceX: number = 0;
  @Input() sourceY: number = 0;
  @Input() targetX: number = 0;
  @Input() targetY: number = 0;
  @Input() type: 'connected' | 'isolated' = 'isolated';

  previousType: string = '';
  isTransitioning: boolean = false;

  strokeColor: string = '';
  strokeDashArray: string = '';
  startX: number = 0;
  startY: number = 0;
  endX: number = 0;
  endY: number = 0;
  point1X: number = 0;
  point1Y: number = 0;
  point2X: number = 0;
  point2Y: number = 0;
  reversePoint1X: number = 0;
  reversePoint1Y: number = 0;
  reversePoint2X: number = 0;
  reversePoint2Y: number = 0;

  private transitionTimer?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] && this.previousType && this.previousType !== this.type) {
      this.isTransitioning = true;
      
      if (this.transitionTimer) {
        clearTimeout(this.transitionTimer);
      }
      
      this.transitionTimer = window.setTimeout(() => {
        this.isTransitioning = false;
        this.previousType = this.type;
      }, 1000);
    } else if (!this.previousType) {
      this.previousType = this.type;
    }

    this.calculatePositions();
  }

  calculatePositions(): void {
    const isConnected = this.type === 'connected';
    this.strokeColor = isConnected ? '#00FF9D' : '#FF3333';
    this.strokeDashArray = isConnected ? 'none' : '5,5';

    const angle = Math.atan2(this.targetY - this.sourceY, this.targetX - this.sourceX);
    
    const radius = 30;
    this.startX = this.sourceX + Math.cos(angle) * radius;
    this.startY = this.sourceY + Math.sin(angle) * radius;
    this.endX = this.targetX - Math.cos(angle) * radius;
    this.endY = this.targetY - Math.sin(angle) * radius;
    
    const arrowSize = 8;
    const arrowAngle = 0.5;
    
    this.point1X = this.endX - arrowSize * Math.cos(angle - arrowAngle);
    this.point1Y = this.endY - arrowSize * Math.sin(angle - arrowAngle);
    this.point2X = this.endX - arrowSize * Math.cos(angle + arrowAngle);
    this.point2Y = this.endY - arrowSize * Math.sin(angle + arrowAngle);
    
    const reverseAngle = Math.atan2(this.sourceY - this.targetY, this.sourceX - this.targetX);
    this.reversePoint1X = this.startX - arrowSize * Math.cos(reverseAngle - arrowAngle);
    this.reversePoint1Y = this.startY - arrowSize * Math.sin(reverseAngle - arrowAngle);
    this.reversePoint2X = this.startX - arrowSize * Math.cos(reverseAngle + arrowAngle);
    this.reversePoint2Y = this.startY - arrowSize * Math.sin(reverseAngle + arrowAngle);
  }

  getLineAnimationStyle(): any {
    if (this.isTransitioning) {
      return {
        animation: this.type === 'connected'
          ? 'link-appear 0.5s ease-out'
          : 'dash-animation 20s linear infinite'
      };
    }
    return {};
  }

  getArrowAnimationStyle(): any {
    if (this.isTransitioning) {
      return { animation: 'link-appear 0.5s ease-out' };
    }
    return {};
  }

  getPointsString(x: number, y: number, p1x: number, p1y: number, p2x: number, p2y: number): string {
    return `${x},${y} ${p1x},${p1y} ${p2x},${p2y}`;
  }

  ngOnDestroy(): void {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
  }
}