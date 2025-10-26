export interface Machine {
    id: string;
    name: string;
    ip: string;
    mac?: string;
    lastUpdate: string;
    status: 'connected' | 'isolated';
}

export interface Link {
    source: string;
    target: string;
    type: 'connected' | 'isolated';
}

export interface Position {
    x: number;
    y: number;
}