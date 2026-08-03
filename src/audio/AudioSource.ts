/**
 * Audio Source for WooJik Engine
 * Individual audio source that can play audio clips
 */

export class AudioSource {
    private context: AudioContext;
    private buffer: AudioBuffer | null = null;
    private sourceNode: AudioBufferSourceNode | null = null;
    private gainNode: GainNode;
    private url: string;
    private isLoaded: boolean = false;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private startTime: number = 0;
    private offset: number = 0;

    constructor(context: AudioContext, url: string) {
        this.context = context;
        this.url = url;
        this.gainNode = context.createGain();
        this.gainNode.connect(context.destination);
    }

    async load(): Promise<void> {
        if (this.isLoaded) return;
        
        try {
            const response = await fetch(this.url);
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await this.context.decodeAudioData(arrayBuffer);
            this.isLoaded = true;
        } catch (error) {
            console.error('Failed to load audio:', this.url, error);
            throw error;
        }
    }

    play(options: Partial<PlayOptions> = {}): void {
        if (!this.isLoaded || !this.buffer) return;
        
        if (this.isPlaying) {
            this.stop();
        }
        
        this.sourceNode = this.context.createBufferSource();
        this.sourceNode.buffer = this.buffer;
        this.sourceNode.connect(this.gainNode);
        
        this.gainNode.gain.value = options.volume || 1;
        this.sourceNode.playbackRate.value = options.rate || 1;
        this.sourceNode.loop = options.loop || false;
        
        const offset = options.startTime || this.offset || 0;
        const duration = this.buffer.duration;
        const endTime = options.endTime || duration;
        
        this.sourceNode.start(0, offset, endTime - offset);
        
        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = this.context.currentTime;
        
        this.sourceNode.onended = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.offset = 0;
        };
    }

    stop(): void {
        if (this.sourceNode) {
            this.sourceNode.stop();
            this.sourceNode.onended = null;
            this.sourceNode = null;
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.offset = 0;
    }

    pause(): void {
        if (!this.isPlaying || !this.sourceNode) return;
        
        this.sourceNode.stop();
        this.offset = this.context.currentTime - this.startTime;
        this.isPlaying = false;
        this.isPaused = true;
    }

    resume(): void {
        if (!this.isPaused) return;
        
        this.play({ startTime: this.offset });
        this.isPaused = false;
    }

    setVolume(volume: number): void {
        this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }

    getVolume(): number {
        return this.gainNode.gain.value;
    }

    setRate(rate: number): void {
        if (this.sourceNode) {
            this.sourceNode.playbackRate.value = rate;
        }
    }

    getRate(): number {
        return this.sourceNode?.playbackRate.value || 1;
    }

    setLoop(loop: boolean): void {
        if (this.sourceNode) {
            this.sourceNode.loop = loop;
        }
    }

    isLooping(): boolean {
        return this.sourceNode?.loop || false;
    }

    isLoaded(): boolean {
        return this.isLoaded;
    }

    isPlaying(): boolean {
        return this.isPlaying && !this.isPaused;
    }

    isPaused(): boolean {
        return this.isPaused;
    }

    getDuration(): number {
        return this.buffer?.duration || 0;
    }

    getCurrentTime(): number {
        if (!this.isPlaying) return this.offset;
        return this.context.currentTime - this.startTime + this.offset;
    }

    unload(): void {
        this.stop();
        this.buffer = null;
        this.isLoaded = false;
    }
}

export interface PlayOptions {
    volume: number;
    loop: boolean;
    rate: number;
    startTime: number;
    endTime: number;
}