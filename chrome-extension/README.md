# Chrome Extension Development

This directory contains all Chrome extension files for NeuralBrain.

## Files

- `manifest.json` - Extension manifest (permissions, scripts, etc.)
- `popup.html` - Extension popup interface
- `popup.js` - Popup logic and UI handling
- `content.js` - Main content script for component detection
- `background.js` - Service worker for background tasks
- `styles.css` - Styles for answer bubbles and UI elements

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select this directory
4. The 🧠 NeuralBrain icon will appear in your toolbar

## Development

To modify the extension:
1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the NeuralBrain extension
4. Test your changes

## Permissions

The extension requires:
- `activeTab` - Access to current tab content
- `storage` - Store user preferences
- `scripting` - Inject content scripts
- Host permission for `http://127.0.0.1:8000/*` - Communicate with local backend
