# YouTube Ad Blocker Firefox Extension - MVP Todo

## Files to Create:
1. **manifest.json** - Extension configuration and permissions
2. **background.js** - Background script for managing ad blocking logic
3. **content.js** - Content script to inject into YouTube pages and block ads
4. **popup.html** - Extension popup interface to show blocked ad count
5. **popup.js** - JavaScript for popup functionality
6. **popup.css** - Styling for popup interface
7. **icons/** - Extension icons (16x16, 48x48, 128x128)

## Core Features:
- Detect and block YouTube video ads, banner ads, and overlay ads
- Count blocked ads and store in browser storage
- Display blocked ad count in extension popup
- Auto-inject content script on youtube.com pages
- Clean, simple popup interface

## Implementation Strategy:
- Use manifest v2 for Firefox compatibility
- Content script to detect and remove ad elements
- Background script to manage storage and communication
- Popup to display statistics with reset option
- CSS selectors to target YouTube ad containers