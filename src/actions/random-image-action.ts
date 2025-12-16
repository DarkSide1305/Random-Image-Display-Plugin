import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import { readFileSync } from "fs";
import { GifReader } from "omggif";
import { PNG } from "pngjs";

/**
 * Settings for the Random Image Display action
 */
type Settings = {
	images: string[];
	gifSettings: { [key: string]: { loop: boolean } };
	allowRepeats: boolean;
	playGifsOnLoad: boolean;
	lastImageIndex?: number;
};

/**
 * GIF animation state
 */
type GifState = {
	frames: string[];
	delays: number[];
	currentFrame: number;
	interval?: NodeJS.Timeout;
	loop: boolean;
};

/**
 * GIF frame cache
 */
const gifFrameCache = new Map<string, { frames: string[], delays: number[] }>();

/**
 * Random Image Display action
 */
@action({ UUID: "com.darkside1305.random-image-display.random-image" })
export class RandomImageAction extends SingletonAction<Settings> {
	private gifStates = new Map<string, GifState>();
	
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		console.log('[ACTION] Settings received');
	}
	
	override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
		console.log('[ACTION] onWillAppear called');
		const settings = ev.payload.settings;
		
		if (!settings.images) {
			await ev.action.setSettings({ 
				images: [],
				gifSettings: {},
				allowRepeats: true,
				playGifsOnLoad: true,
				lastImageIndex: -1
			});
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
			return;
		}
		
		if (settings.allowRepeats === undefined) settings.allowRepeats = true;
		if (settings.playGifsOnLoad === undefined) settings.playGifsOnLoad = true;
		if (!settings.gifSettings) settings.gifSettings = {};
		
		// Show the last displayed image (or default icon if none)
		if (settings.images.length > 0 && settings.lastImageIndex !== undefined && settings.lastImageIndex >= 0) {
			const lastImagePath = settings.images[settings.lastImageIndex];
			
			// Check if it's a GIF
			if (this.isGif(lastImagePath)) {
				// Only play GIF if playGifsOnLoad is enabled
				if (settings.playGifsOnLoad !== false) {
					const loop = settings.gifSettings?.[lastImagePath]?.loop !== false;
					await this.playGif(ev.action, lastImagePath, loop);
				} else {
					// Just show the first frame (static)
					await ev.action.setImage(lastImagePath);
				}
			} else {
				await ev.action.setImage(lastImagePath);
			}
		} else {
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
		}
	}

	override async onWillDisappear(ev: WillDisappearEvent<Settings>): Promise<void> {
		this.stopAllGifAnimations(ev.action.id);
	}

	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		const settings = ev.payload.settings;
		
		if (!settings.images || settings.images.length === 0) {
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
			return;
		}
		
		await this.showRandomImage(ev.action, settings);
	}

	private async showRandomImage(action: any, settings: Settings): Promise<void> {
		const images = settings.images;
		const allowRepeats = settings.allowRepeats !== false;
		const lastIndex = settings.lastImageIndex ?? -1;
		
		let randomIndex: number;
		
		if (images.length === 1) {
			randomIndex = 0;
		} else if (!allowRepeats && images.length > 1) {
			do {
				randomIndex = Math.floor(Math.random() * images.length);
			} while (randomIndex === lastIndex);
		} else {
			randomIndex = Math.floor(Math.random() * images.length);
		}
		
		const imagePath = images[randomIndex];
		
		this.stopAllGifAnimations(action.id);
		
		if (this.isGif(imagePath)) {
			const loop = settings.gifSettings?.[imagePath]?.loop !== false;
			await this.playGif(action, imagePath, loop);
		} else {
			await action.setImage(imagePath);
		}
		
		await action.setSettings({
			...settings,
			lastImageIndex: randomIndex
		});
	}

	private isGif(filePath: string): boolean {
		return filePath.toLowerCase().endsWith('.gif');
	}

	/**
	 * Validate that a frame has actual content (not all transparent/black)
	 */
	private isValidFrame(pixels: Uint8ClampedArray): boolean {
		let hasColor = false;
		for (let i = 0; i < pixels.length; i += 4) {
			const a = pixels[i + 3];
			if (a > 0) {
				const r = pixels[i];
				const g = pixels[i + 1];
				const b = pixels[i + 2];
				if (r > 0 || g > 0 || b > 0) {
					hasColor = true;
					break;
				}
			}
		}
		return hasColor;
	}

	private async playGif(action: any, gifPath: string, loop: boolean): Promise<void> {
		try {
			console.log('[ACTION] Loading GIF:', gifPath);
			
			let cachedData = gifFrameCache.get(gifPath);
			
			if (!cachedData) {
				console.log('[ACTION] Decoding GIF with omggif...');
				
				const gifData = readFileSync(gifPath);
				const reader = new GifReader(gifData);
				
				const width = reader.width;
				const height = reader.height;
				const numFrames = reader.numFrames();
				
				console.log('[ACTION] GIF:', width, 'x', height, numFrames, 'frames');
				
				const frames: string[] = [];
				const delays: number[] = [];
				
				// Keep canvas for compositing
				const pixels = new Uint8ClampedArray(width * height * 4);
				const previousPixels = new Uint8ClampedArray(width * height * 4);
				let lastValidFrame: string | null = null;
				
				// Initialize to transparent
				pixels.fill(0);
				
				for (let i = 0; i < numFrames; i++) {
					try {
						const frameInfo = reader.frameInfo(i);
						
						console.log(`[ACTION] Frame ${i}: x=${frameInfo.x}, y=${frameInfo.y}, w=${frameInfo.width}, h=${frameInfo.height}, disposal=${frameInfo.disposal}`);
						
						// Handle disposal from previous frame
						if (i > 0) {
							const prevFrameInfo = reader.frameInfo(i - 1);
							
							if (prevFrameInfo.disposal === 2) {
								// Clear ONLY the previous frame's area to transparent
								const px = prevFrameInfo.x;
								const py = prevFrameInfo.y;
								const pw = prevFrameInfo.width;
								const ph = prevFrameInfo.height;
								
								for (let y = py; y < py + ph && y < height; y++) {
									for (let x = px; x < px + pw && x < width; x++) {
										const idx = (y * width + x) * 4;
										pixels[idx] = 0;
										pixels[idx + 1] = 0;
										pixels[idx + 2] = 0;
										pixels[idx + 3] = 0;
									}
								}
							} else if (prevFrameInfo.disposal === 3) {
								// Restore previous
								for (let j = 0; j < pixels.length; j++) {
									pixels[j] = previousPixels[j];
								}
							}
							// For disposal 0 or 1, keep pixels as-is
						}
						
						// Backup before blitting
						for (let j = 0; j < pixels.length; j++) {
							previousPixels[j] = pixels[j];
						}
						
						// Decode frame - this only updates the frame's region
						reader.decodeAndBlitFrameRGBA(i, pixels);
						
						// Validate frame
						if (!this.isValidFrame(pixels) && lastValidFrame) {
							console.log(`[ACTION] Frame ${i} invalid, reusing last valid frame`);
							frames.push(lastValidFrame);
							delays.push(frameInfo.delay * 10 || 100);
							continue;
						}
						
						// Convert to PNG
						const png = new PNG({ width, height });
						for (let j = 0; j < pixels.length; j++) {
							png.data[j] = pixels[j];
						}
						
						const pngBuffer = PNG.sync.write(png);
						const pngBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
						
						frames.push(pngBase64);
						lastValidFrame = pngBase64;
						delays.push(frameInfo.delay * 10 || 100);
						
					} catch (error) {
						console.error(`[ACTION] Error on frame ${i}:`, error);
						if (lastValidFrame) {
							frames.push(lastValidFrame);
							delays.push(100);
						}
					}
				}
				
				cachedData = { frames, delays };
				gifFrameCache.set(gifPath, cachedData);
				
				console.log('[ACTION] GIF cached:', frames.length, 'frames');
			} else {
				console.log('[ACTION] Using cached GIF');
			}
			
			const gifState: GifState = {
				frames: cachedData.frames,
				delays: cachedData.delays,
				currentFrame: 0,
				loop
			};
			
			this.gifStates.set(action.id, gifState);
			this.animateGif(action, gifState);
			
		} catch (error) {
			console.error('[ACTION] Error loading GIF:', error);
			await action.setImage(gifPath);
		}
	}

	private animateGif(action: any, gifState: GifState): void {
		const showNextFrame = async () => {
			if (!this.gifStates.has(action.id)) return;
			
			const frame = gifState.frames[gifState.currentFrame];
			await action.setImage(frame);
			
			const delay = gifState.delays[gifState.currentFrame];
			gifState.currentFrame++;
			
			if (gifState.currentFrame >= gifState.frames.length) {
				if (gifState.loop) {
					gifState.currentFrame = 0;
				} else {
					console.log('[ACTION] GIF complete');
					return;
				}
			}
			
			gifState.interval = setTimeout(showNextFrame, delay);
		};
		
		// Add a small initial delay (300ms) so user can lift their finger
		setTimeout(showNextFrame, 300);
	}

	private stopAllGifAnimations(actionId: string): void {
		const gifState = this.gifStates.get(actionId);
		if (gifState?.interval) {
			clearTimeout(gifState.interval);
		}
		this.gifStates.delete(actionId);
	}
}