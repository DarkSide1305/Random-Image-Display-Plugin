import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

/**
 * Settings for the Random Image Display action
 */
type Settings = {
	images: string[]; // Array of file paths to images
	allowRepeats: boolean; // Whether to allow the same image multiple times in a row
	lastImageIndex?: number; // Track the last shown image index
};

/**
 * Random Image Display action that randomly shows one of the selected images
 */
@action({ UUID: "com.darkside1305.random-image-display.random-image" })
export class RandomImageAction extends SingletonAction<Settings> {
	
	/**
	 * Occurs when the action appears on the Stream Deck (when added or Stream Deck starts)
	 */
	override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
		const settings = ev.payload.settings;
		
		// Initialize default settings if they don't exist
		if (!settings.images) {
			await ev.action.setSettings({ 
				images: [],
				allowRepeats: true,
				lastImageIndex: -1
			});
			// Show default icon when no images are configured
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
			return;
		}
		
		// Set default for allowRepeats if not set
		if (settings.allowRepeats === undefined) {
			settings.allowRepeats = true;
		}
		
		// Display a random image if we have any images saved, otherwise show default icon
		if (settings.images.length > 0) {
			await this.showRandomImage(ev.action, settings);
		} else {
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
		}
	}

	/**
	 * Occurs when the user presses the key action
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		const settings = ev.payload.settings;
		
		// If no images are configured, show default image
		if (!settings.images || settings.images.length === 0) {
			await ev.action.setImage("imgs/actions/random/random-icon-white.png");
			return;
		}
		
		// Display a random image
		await this.showRandomImage(ev.action, settings);
	}

	/**
	 * Helper method to display a random image from the array
	 */
	private async showRandomImage(action: any, settings: Settings): Promise<void> {
		const images = settings.images;
		const allowRepeats = settings.allowRepeats !== false; // Default to true
		const lastIndex = settings.lastImageIndex ?? -1;
		
		let randomIndex: number;
		
		// If we only have one image, just show it
		if (images.length === 1) {
			randomIndex = 0;
		} 
		// If repeats not allowed and we have more than one image
		else if (!allowRepeats && images.length > 1) {
			// Keep generating random index until it's different from last
			do {
				randomIndex = Math.floor(Math.random() * images.length);
			} while (randomIndex === lastIndex);
		} 
		// Repeats allowed or not enough images to avoid repeats
		else {
			randomIndex = Math.floor(Math.random() * images.length);
		}
		
		const randomImage = images[randomIndex];
		
		// Update the image
		await action.setImage(randomImage);
		
		// Save the last shown index
		await action.setSettings({
			...settings,
			lastImageIndex: randomIndex
		});
	}
}