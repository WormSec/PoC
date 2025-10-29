import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { VisualizerComponent } from './components/visualizer/visualizer.component';
import { InformationComponent } from './components/information/information.component';
import { FooterComponent } from './components/footer/footer.component';
import { Machine, Link, Position } from './models/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    VisualizerComponent,
    InformationComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  machines: Machine[] = [
  {
    id: '1',
    name: '1',
    ip: '192.168.1.10',
    mac: '00:1B:44:11:3A:B7',
    lastUpdate: '01/03/2025',
    status: 'connected'
  },
  {
    id: '2',
    name: '2',
    ip: '192.168.1.20',
    mac: '00:1B:44:11:3A:B8',
    lastUpdate: '28/02/2025',
    status: 'isolated'
  },
  {
    id: '3',
    name: '3',
    ip: '192.168.1.30',
    mac: '00:1B:44:11:3A:B9',
    lastUpdate: '02/03/2025',
    status: 'connected'
  },
  {
    id: '4',
    name: '4',
    ip: '192.168.1.40',
    mac: '00:1B:44:11:3A:C0',
    lastUpdate: '03/03/2025',
    status: 'connected'
  }
];

  links: Link[] = [
    { source: '1', target: '2', type: 'connected' },
    { source: '2', target: '3', type: 'isolated' },
    { source: '3', target: '4', type: 'connected' },
    { source: '4', target: '1', type: 'connected' },
    { source: '1', target: '3', type: 'connected' },
    { source: '2', target: '4', type: 'isolated' }
  ];

  selectedMachine: Machine | null = null;
  positions: Record<string, Position> = {};

  ngOnInit(): void {
    if (this.isBrowser) {
      const savedPositions = localStorage.getItem('machinePositions');
      if (savedPositions) {
        try {
          this.positions = JSON.parse(savedPositions);
        } catch (e) {
          console.error('Error loading saved positions:', e);
        }
      }
    }
  }

  onMachineClick(machine: Machine): void {
    if (this.selectedMachine?.id === machine.id) {
      this.selectedMachine = null;
    } else {
      this.selectedMachine = machine;
    }
    console.log('Machine clicked:', machine);
  }

  onPositionsChange(positions: Record<string, Position>): void {
    this.positions = positions;
    if (this.isBrowser) {
      localStorage.setItem('machinePositions', JSON.stringify(positions));
    }
  }

  private simulateStatusChanges(): void {
    if (!this.isBrowser) return;

    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.machines.length);
      const machine = this.machines[randomIndex];
      
      machine.status = machine.status === 'connected' ? 'isolated' : 'connected';
      
      const now = new Date();
      machine.lastUpdate = now.toISOString().replace('T', ' ').substring(0, 19);
      
      this.links = this.links.map(link => {
        if (link.source === machine.id || link.target === machine.id) {
          return {
            ...link,
            type: machine.status
          };
        }
        return link;
      });

      this.machines = [...this.machines];
      this.links = [...this.links];

      if (this.selectedMachine?.id === machine.id) {
        this.selectedMachine = { ...machine };
      }

      console.log(`Machine ${machine.name} changed to ${machine.status}`);
    }, 5000);
  }
}