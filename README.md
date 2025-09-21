# YouTube Ad Blocker Firefox Extension

A powerful Firefox extension that automatically blocks YouTube ads and tracks the number of blocked ads.

## Features

- 🚫 **Automatic Ad Blocking**: Blocks all types of YouTube ads including video ads, banner ads, overlay ads, and sidebar ads
- 📊 **Ad Counter**: Tracks and displays the number of blocked ads
- 🎯 **Real-time Protection**: Works instantly when you visit YouTube
- 🔄 **Auto-Skip**: Automatically skips video ads when possible
- 💾 **Persistent Storage**: Remembers your blocked ad count across browser sessions
- 🎨 **Beautiful UI**: Clean, modern popup interface

## Installation Instructions

### Method 1: Load as Temporary Extension (For Testing)

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`
5. The extension will be loaded and active immediately

### Method 2: Load as Developer Extension

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required` and set it to `false`
3. Navigate to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Select the extension's `.zip` file (if packaged) or load the folder

### Method 3: Package and Install

1. Zip all the extension files together
2. Rename the `.zip` file to `.xpi`
3. Drag and drop the `.xpi` file into Firefox
4. Click "Add" when prompted

## How to Use

1. **Install the Extension**: Follow one of the installation methods above
2. **Visit YouTube**: Navigate to `youtube.com`
3. **Automatic Protection**: The extension will automatically start blocking ads
4. **View Statistics**: Click the extension icon in the toolbar to see blocked ad count
5. **Reset Counter**: Use the "Reset Counter" button in the popup to reset statistics

## Extension Files

- `manifest.json` - Extension configuration and permissions
- `background.js` - Background script for managing storage and communication
- `content.js` - Content script that blocks ads on YouTube pages
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and statistics display
- `popup.css` - Popup styling
- `icons/` - Extension icons (16x16, 48x48, 128x128)

## Technical Details

### Ad Blocking Strategy

The extension uses multiple techniques to block YouTube ads:

1. **CSS Injection**: Hides ad containers using CSS rules
2. **DOM Manipulation**: Removes ad elements from the page
3. **Auto-Skip**: Automatically clicks skip buttons when available
4. **Video Ad Blocking**: Pauses and skips video ads
5. **Mutation Observer**: Monitors page changes for new ads

### Permissions Required

- `storage` - To save blocked ad count
- `activeTab` - To interact with the current tab
- `*://www.youtube.com/*` - To run on YouTube pages
- `*://youtube.com/*` - To run on YouTube pages

### Browser Compatibility

- **Firefox**: Fully supported (Manifest V2)
- **Chrome**: Compatible with minor modifications
- **Edge**: Compatible with minor modifications

## Troubleshooting

### Extension Not Working

1. Make sure you're on `youtube.com` or `www.youtube.com`
2. Refresh the YouTube page after installing
3. Check if the extension is enabled in `about:addons`
4. Try disabling other ad blockers that might conflict

### Ads Still Showing

1. Clear browser cache and cookies
2. Disable other extensions temporarily
3. Make sure the extension has proper permissions
4. Try refreshing the page

### Counter Not Updating

1. Check if the extension popup opens correctly
2. Try resetting the counter and testing again
3. Make sure storage permissions are granted

## Development

### File Structure
```
youtube-ad-blocker/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Testing

1. Load the extension in Firefox developer mode
2. Visit YouTube and play various videos
3. Check the popup for blocked ad count
4. Test the reset functionality

## Privacy

This extension:
- ✅ Does NOT collect any personal data
- ✅ Does NOT send data to external servers
- ✅ Only stores blocked ad count locally
- ✅ Only runs on YouTube pages
- ✅ Is completely open source

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure you're using a supported Firefox version
3. Try reinstalling the extension
4. Clear browser data and try again

## Version History

- **v1.0.0** - Initial release with core ad blocking functionality

---

**Note**: This extension is for educational purposes. Please support content creators you enjoy by considering YouTube Premium or other legitimate means.