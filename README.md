# Random Image Display - Stream Deck Plugin

A Stream Deck plugin that randomly displays images from your collection with each button press.

## Features

- 🎲 **Random Display**: Shows a random image from your collection each time you press the button
- 🖼️ **Multiple Images**: Add as many images as you want
- 🔄 **No Repeats Option**: Toggle to prevent the same image appearing twice in a row
- 💾 **Persistent Storage**: Your images are saved across Stream Deck restarts
- 🎨 **Easy Management**: Simple UI to add and remove images

## Installation

### From Release (Recommended)

1. Download the latest `.streamDeckPlugin` file from [Releases](../../releases)
2. Double-click the file to install
3. The plugin will appear in your Stream Deck actions list

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/YourUsername/random-image-display.git
   cd random-image-display
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and link the plugin:
   ```bash
   npm run build
   streamdeck link com.darkside1305.random-image-display.sdPlugin
   ```

## Usage

1. **Add the action** to your Stream Deck by dragging "Random Image" onto a button
2. **Click the button** in Stream Deck software to open settings
3. **Add images** using the "Choose Image File" button
4. **Toggle "Allow Repeats"** if you want to prevent consecutive duplicates
5. **Press the button** on your Stream Deck to display random images!

## Configuration

### Allow Repeats

- **ON** (default): Images can repeat - fully random selection every time
- **OFF**: Never shows the same image twice in a row (requires 2+ images)

### Managing Images

- Click **"Choose Image File"** to add images
- Each image appears in the list as "Picture 1", "Picture 2", etc.
- Click **"✕ Remove"** next to any image to delete it
- Images persist across Stream Deck restarts

## Development

### Prerequisites

- Node.js 20+
- Stream Deck software 6.9+
- Stream Deck CLI (`npm install -g @elgato/cli`)

### Setup

```bash
# Install dependencies
npm install

# Start development mode (auto-rebuild on changes)
npm run watch

# Build for production
npm run build

# Package for distribution
streamdeck pack com.darkside1305.random-image-display.sdPlugin
```

### Project Structure

```
random-image-display/
├── src/
│   ├── plugin.ts                      # Main plugin entry point
│   └── actions/
│       └── random-image-action.ts     # Action logic
├── com.darkside1305.random-image-display.sdPlugin/
│   ├── bin/                           # Built JavaScript
│   ├── imgs/                          # Icons and images
│   ├── ui/
│   │   └── random-image.html          # Property Inspector UI
│   └── manifest.json                  # Plugin metadata
└── package.json
```

## Technical Details

- **SDK Version**: Stream Deck SDK v3
- **Minimum Stream Deck Version**: 6.9
- **Node.js Version**: 20
- **Supported Platforms**: Windows 10+, macOS 12+

## Troubleshooting

**Images not appearing?**
- Make sure the image file paths are valid
- Check that images are in a supported format (PNG, JPG, GIF, SVG)

**Settings not saving?**
- Make sure you're running Stream Deck 6.9 or later
- Try restarting the Stream Deck software

**Plugin not loading?**
- Check the logs in `%appdata%\Elgato\StreamDeck\logs\` (Windows) or `~/Library/Logs/ElgatoStreamDeck/` (macOS)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See [LICENSE](LICENSE) file for details

## Author

**DarkSide1305**

## Changelog

### v1.0.0.0 (Initial Release)
- Random image display functionality
- Multiple image support
- Allow/prevent repeats toggle
- Persistent storage across restarts
- Property Inspector UI for easy management