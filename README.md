# AutoPurge - Automatic History Cleaner

A Chrome extension that automatically removes browsing history for specified domains after you leave the page. Perfect for maintaining privacy while browsing sensitive content.

## Features

- 🔄 **Automatic History Deletion**: Removes URLs from Chrome history after leaving the page
- 🎯 **Smart Domain Matching**: Works with both exact domains and subdomains
- ⏱️ **Configurable Delay**: Set deletion delay (3, 10, or 30 seconds)
- 📋 **Preset Domain Library**: Built-in list of adult content domains (read-only)
- ✏️ **Custom Domains**: Add up to 10 custom domains (free plan)
- 📊 **Usage Statistics**: Track deletion counts without storing URLs
- 🚀 **Quick Cleanup**: One-click deletion of recent history (5min/15min/1hour)
- 🔒 **Privacy First**: No data uploaded to servers, all processing local

## Installation

### Option 1: Load as Unpacked Extension (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" button
5. Select the `extension` folder from this project
6. The AutoPurge extension should now appear in your extensions list

### Option 2: Manual Installation

1. Download the extension files
2. Create a new folder for the extension
3. Copy all files from the `extension` directory to your folder
4. Follow the steps above to load as unpacked extension

## Permissions Explained

The extension requires the following permissions:

- **history**: To delete specific URLs from your browsing history
- **storage**: To save your settings and domain lists locally
- **tabs**: To monitor tab changes and navigation events
- **webNavigation**: To detect when you visit or leave pages
- **host_permissions**: To monitor HTTP/HTTPS websites (excludes chrome://, file://, etc.)

## How It Works

1. **Domain Monitoring**: The extension monitors your web navigation for domains in your configured lists
2. **Delay Timer**: When you visit a matching domain, a deletion timer starts
3. **Automatic Cleanup**: After the configured delay (default 10 seconds), the URL is removed from Chrome history
4. **Debouncing**: Multiple visits to the same URL are deduplicated to avoid excessive deletions

## Configuration

### Main Settings

- **Enable/Disable**: Toggle the extension on/off
- **Deletion Delay**: Choose between 3, 10, or 30 seconds
- **Custom Domains**: Add your own domains (up to 10 on free plan)

### Domain Management

- **Preset Domains**: Built-in list of adult content sites (cannot be modified)
- **Custom Domains**: Add domains like `example.com` (matches subdomains automatically)
- **Domain Validation**: Ensures proper domain format before adding

### Quick Cleanup

Use the popup to quickly delete recent history:
- Last 5 minutes
- Last 15 minutes  
- Last 1 hour

## Privacy Policy

This extension is designed with privacy as the top priority:

- ✅ **No Data Upload**: Nothing is sent to external servers
- ✅ **Local Storage Only**: All settings stored locally on your device
- ✅ **No URL Logging**: The extension never stores or logs the URLs you visit
- ✅ **No Tracking**: No analytics or tracking of any kind
- ✅ **Minimal Permissions**: Only requests necessary permissions for functionality

📄 **Full Privacy Policy**:
- [English](https://github.com/cengfanman/auto-purge/blob/main/PRIVACY_EN.md)
- [中文](https://github.com/cengfanman/auto-purge/blob/main/PRIVACY.md)

## File Structure

```
extension/
├── manifest.json           # Extension configuration (MV3)
├── background.js           # Service worker for navigation monitoring
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── styles.css             # Shared CSS styles
└── data/
    └── preset-domains.json # Preset adult content domains
```

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Build extension package
npm run zip

# Clean build artifacts
npm run clean
```

### File Responsibilities

- **manifest.json**: Extension metadata, permissions, and entry points
- **background.js**: Service worker that monitors navigation and schedules deletions
- **options.html/js**: Settings page for domain management and configuration
- **popup.html/js**: Quick access popup for statistics and immediate actions
- **styles.css**: Consistent styling across all extension pages
- **preset-domains.json**: Read-only list of common adult content domains
- **crypto.js**: Encryption utilities for Pro features (AES-GCM, PBKDF2)
- **db.js**: IndexedDB management for shadow history storage

### Key Technical Details

- Uses Manifest V3 (latest Chrome extension format)
- Service worker architecture for efficient background processing
- Debounced deletion queue to avoid duplicate operations
- Subdomain matching using hostname analysis
- Daily statistics reset at midnight

## Limitations

### Free Plan
- Maximum 10 custom domains
- Basic deletion delay options
- Standard support

### Technical Limitations
- Only works with HTTP/HTTPS protocols
- Cannot delete history from other browsers
- Requires extension to be enabled to function
- May not work in incognito mode (by design)

### Recovery Limitations
- **Cannot restore original timestamps**: Due to Chrome History API restrictions, deleted history entries cannot be restored with their original visit timestamps
- **Recovery options**: Pro users can access shadow history to:
  - View decrypted records (requires PIN)
  - Open multiple URLs in new tabs
  - Export as HTML bookmarks
  - Export as CSV for external analysis
- **No time-travel**: All recovered URLs will appear as "new" visits when opened

## Support

For issues, feature requests, or questions:

- **Email**: ilovexuu2024@gmail.com
- **Telegram**: https://t.me/autopurge_support
- **Discord**: https://discord.gg/jsh8xK8Wzq
- **GitHub Issues**: https://github.com/cengfanman/auto-purge/issues

### Troubleshooting

1. Check if the extension is enabled in Chrome settings
2. Verify that you're visiting HTTP/HTTPS sites (not chrome:// pages)
3. Check the developer console for any error messages
4. Try disabling and re-enabling the extension

## Upgrade to Pro (Placeholder)

The extension includes placeholder upgrade functionality for future monetization:

- Unlimited custom domains
- Advanced scheduling options
- Bulk domain import/export
- Priority support
- Custom deletion patterns

## License

This project is released under the MIT License. See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Note**: This extension is for educational and privacy purposes. Use responsibly and in accordance with your organization's policies and local laws.
# auto-purge
