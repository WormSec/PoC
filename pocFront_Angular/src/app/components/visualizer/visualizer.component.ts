import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, NO_ERRORS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine, Link, Position } from '../../models/types';

@Component({
  selector: 'app-visualizer',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnChanges, AfterViewInit {
  @Input() machines: Machine[] = [];
  @Input() links: Link[] = [];
  @Input() isReduced: boolean = false;
  @Input() initialPositions?: Record<string, Position>;
  @Output() machineClick = new EventEmitter<Machine>();
  @Output() positionsChange = new EventEmitter<Record<string, Position>>();

  @ViewChild('svgElement', { static: false }) svgRef!: ElementRef<SVGSVGElement>;
  Object = Object;

  positions: Record<string, Position> = {};
  dragging: string | null = null;
  viewBox = { x: 0, y: 0, width: 550, height: 350 };
  isPanning = false;
  lastPosition = { x: 0, y: 0 };
  scale = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialPositions']) {
      this.initializePositions();
    }
  }

  ngAfterViewInit(): void {
    if (this.machines.length > 0 && Object.keys(this.positions).length === 0) {
      this.initializePositions();
    }
  }

  initializePositions(): void {
    if (this.initialPositions && Object.keys(this.initialPositions).length > 0) {
      this.positions = { ...this.initialPositions };
    } else {
      const circlePositions = this.calculateCirclePositions();
      this.positions = { ...circlePositions };
    }

    const circlePositions = this.calculateCirclePositions();
    this.machines.forEach(machine => {
      if (!this.positions[machine.id]) {
        this.positions[machine.id] = circlePositions[machine.id];
      }
    });
  }

  calculateCirclePositions(): Record<string, Position> {
    const centerX = 275;
    const centerY = 175;
    const radius = 100;
    
    const circlePositions: Record<string, Position> = {};
    this.machines.forEach((machine, index) => {
      const angle = (index * 2 * Math.PI) / this.machines.length;
      circlePositions[machine.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return circlePositions;
  }

  handleSvgMouseDown(event: MouseEvent): void {
    if (event.button === 0 && !this.dragging) {
      this.isPanning = true;
      this.lastPosition = { x: event.clientX, y: event.clientY };
    }
  }

  handleSvgMouseMove(event: MouseEvent): void {
    if (this.dragging) {
      const svg = this.svgRef.nativeElement;
      if (!svg) return;
      
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      
      const svgP = point.matrixTransform(ctm.inverse());
      
      this.positions = {
        ...this.positions,
        [this.dragging]: {
          x: svgP.x,
          y: svgP.y
        }
      };
      
      this.positionsChange.emit(this.positions);
    } else if (this.isPanning) {
      const dx = event.clientX - this.lastPosition.x;
      const dy = event.clientY - this.lastPosition.y;
      
      const panSpeed = 1 / this.scale;
      
      this.viewBox = {
        ...this.viewBox,
        x: this.viewBox.x - dx * panSpeed,
        y: this.viewBox.y - dy * panSpeed
      };
      
      this.lastPosition = { x: event.clientX, y: event.clientY };
    }
  }

  handleSvgMouseUp(): void {
    this.isPanning = false;
    this.dragging = null;
  }

  handleSvgMouseLeave(): void {
    this.isPanning = false;
    this.dragging = null;
  }

  handleMachineDragStart(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.dragging = id;
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const svg = this.svgRef.nativeElement;
    if (!svg) return;
    
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgP = point.matrixTransform(ctm.inverse());
    
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.5, Math.min(5, this.scale * zoomFactor));
    
    const newWidth = this.viewBox.width * (this.scale / newScale);
    const newHeight = this.viewBox.height * (this.scale / newScale);
    
    const mouseXRatio = (svgP.x - this.viewBox.x) / this.viewBox.width;
    const mouseYRatio = (svgP.y - this.viewBox.y) / this.viewBox.height;
    
    const newX = svgP.x - mouseXRatio * newWidth;
    const newY = svgP.y - mouseYRatio * newHeight;
    
    this.viewBox = {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    };
    
    this.scale = newScale;
  }

  handleZoomIn(): void {
    const newScale = Math.min(5, this.scale * 1.2);
    const centerX = this.viewBox.x + this.viewBox.width / 2;
    const centerY = this.viewBox.y + this.viewBox.height / 2;
    const newWidth = this.viewBox.width * (this.scale / newScale);
    const newHeight = this.viewBox.height * (this.scale / newScale);
    
    this.viewBox = {
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    };
    
    this.scale = newScale;
  }

  handleZoomOut(): void {
    const newScale = Math.max(0.5, this.scale / 1.2);
    const centerX = this.viewBox.x + this.viewBox.width / 2;
    const centerY = this.viewBox.y + this.viewBox.height / 2;
    const newWidth = this.viewBox.width * (this.scale / newScale);
    const newHeight = this.viewBox.height * (this.scale / newScale);
    
    this.viewBox = {
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    };
    
    this.scale = newScale;
  }

  getLinkStartX(link: Link): number {
    const angle = Math.atan2(
      this.positions[link.target].y - this.positions[link.source].y,
      this.positions[link.target].x - this.positions[link.source].x
    );
    return this.positions[link.source].x + Math.cos(angle) * 30;
  }

  getLinkStartY(link: Link): number {
    const angle = Math.atan2(
      this.positions[link.target].y - this.positions[link.source].y,
      this.positions[link.target].x - this.positions[link.source].x
    );
    return this.positions[link.source].y + Math.sin(angle) * 30;
  }

  getLinkEndX(link: Link): number {
    const angle = Math.atan2(
      this.positions[link.target].y - this.positions[link.source].y,
      this.positions[link.target].x - this.positions[link.source].x
    );
    return this.positions[link.target].x - Math.cos(angle) * 30;
  }

  getLinkEndY(link: Link): number {
    const angle = Math.atan2(
      this.positions[link.target].y - this.positions[link.source].y,
      this.positions[link.target].x - this.positions[link.source].x
    );
    return this.positions[link.target].y - Math.sin(angle) * 30;
  }

  getLinkColor(link: Link): string {
    const sourceMachine = this.machines.find(m => m.id === link.source);
    const targetMachine = this.machines.find(m => m.id === link.target);
    
    if (sourceMachine?.status === 'isolated' || targetMachine?.status === 'isolated') {
      return '#FF3333';
    }
    
    return '#00FF9D';
  }

  getLinkDashArray(link: Link): string {
    const sourceMachine = this.machines.find(m => m.id === link.source);
    const targetMachine = this.machines.find(m => m.id === link.target);
    
    if (sourceMachine?.status === 'isolated' || targetMachine?.status === 'isolated') {
      return '5,5';
    }
    
    return 'none';
  }

  handleResetPositions(): void {
    const freshCirclePositions = this.calculateCirclePositions();
    this.positions = freshCirclePositions;
    this.positionsChange.emit(freshCirclePositions);
    
    this.viewBox = { x: 0, y: 0, width: 550, height: 350 };
    this.scale = 1;
  }

  getViewBoxString(): string {
    return `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`;
  }

  onMachineClick(machine: Machine): void {
    this.machineClick.emit(machine);
  }

  trackByMachineId(index: number, machine: Machine): string {
    return machine.id;
  }

  trackByLinkIndex(index: number): number {
    return index;
  }
}