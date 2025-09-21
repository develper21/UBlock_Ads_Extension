# Project Summary
The YouTube Ad Blocker Pro is an advanced Firefox extension that enhances user experience on YouTube by effectively blocking various ad types, including video ads, banners, and overlays. It integrates the SponsorBlock API to skip sponsored segments, intros, and outros, providing a seamless viewing experience. This extension not only blocks ads but also tracks and displays statistics on blocked content, ensuring users enjoy uninterrupted access to their favorite videos while maintaining their privacy without collecting personal data.

# Project Module Description
## Core Functional Modules:
- **Ad Blocking Engine**: Utilizes a hybrid approach of DOM and network request blocking to detect and remove ads efficiently.
- **SponsorBlock Integration**: Automatically skips sponsor segments and allows user contributions to improve the database of segments.
- **Ad Counter**: Tracks and displays the number of ads blocked and segments skipped in a user-friendly interface.
- **Background Management**: Manages storage, settings, and communication between scripts.
- **Popup Interface**: Provides a visual representation of blocked ads and allows users to reset counts and configure settings.

# Directory Tree
```
youtube-ad-blocker/
├── manifest.json         # Extension configuration and permissions
├── background.js         # Background script for managing ad blocking logic
├── content.js            # Content script that blocks ads on YouTube pages
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality and statistics display
├── popup.css             # Popup styling
├── icons/                # Extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png       
│   ├── icon48.png       
│   └── icon128.png      
├── README.md             # Installation and usage guide
├── index.html            # Landing page for the extension
├── style.css             # Styling for the landing page
├── script.js             # Main JavaScript for the landing page
├── sponsorblock.js       # Integration with SponsorBlock API for skipping segments
├── adblock.js            # Advanced ad blocking logic
└── utils.js              # Utility functions for the extension
```

# File Description Inventory
- **manifest.json**: Configuration file defining the extension's properties, permissions, and scripts.
- **background.js**: Manages the ad blocking logic and tracks the number of ads blocked.
- **content.js**: Contains the logic to detect and remove ads from YouTube.
- **popup.html**: The HTML structure for the extension's popup.
- **popup.js**: Handles the logic for the popup, including displaying blocked ad counts.
- **popup.css**: Styles for the popup interface.
- **icons/**: Directory containing different sizes of icons for the extension.
- **README.md**: Documentation for installation and usage.
- **index.html**: The landing page that explains the extension's features.
- **style.css**: Styles for the landing page.
- **script.js**: JavaScript for enhancing the landing page's interactivity.
- **sponsorblock.js**: Script for integrating with the SponsorBlock API.
- **adblock.js**: Contains the advanced logic for ad blocking.
- **utils.js**: Utility functions for common tasks within the extension.

# Technology Stack
- **JavaScript**: For implementing the extension's functionality.
- **HTML/CSS**: For structuring and styling the popup and landing page.
- **WebExtensions API**: For building the Firefox extension.

# Usage
1. **Installation**:
   - Open Firefox and navigate to `about:debugging`.
   - Click on "This Firefox" and then "Load Temporary Add-on".
   - Select the `manifest.json` file from the extension folder.
   
2. **Running the Extension**:
   - Go to YouTube.
   - The extension will automatically block ads and track the number of ads blocked and segments skipped.

3. **Using the Popup**:
   - Click the extension icon in the toolbar to view the number of blocked ads and skipped segments.
   - Use the "Reset Counter" button to reset the ad count.
