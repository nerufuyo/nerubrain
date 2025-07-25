# Coursera Automation Extension - Installation & Testing Guide

## 🔧 Fixed Issues

### 1. ✅ Icon Files Fixed
- **Problem**: Icon files were placeholder text files, not actual PNG images
- **Fix**: Created proper PNG icons (16x16, 32x32, 48x48, 128x128) with blue background and white circle design

### 2. ✅ Content Security Policy Fixed  
- **Problem**: Restrictive CSP was blocking popup functionality
- **Fix**: Removed restrictive CSP from manifest.json

### 3. ✅ Popup Simplified
- **Problem**: Complex popup.js might have had compatibility issues
- **Fix**: Created a simplified, reliable popup (popup-simple.html + popup-simple.js)

### 4. ✅ Permissions Added
- **Problem**: Missing permissions for notifications
- **Fix**: Added "notifications" permission to manifest.json

## 📦 Installation Instructions

### Step 1: Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder: `/Users/infantai/Projects/nerubrain/dist`
5. The extension should appear with the blue circular icon

### Step 2: Verify Installation
1. Check that the extension shows "No errors" 
2. The extension icon should appear in Chrome toolbar
3. Click the icon - popup should open immediately

## 🧪 Testing Instructions

### Test 1: Basic Popup Functionality
1. Click the extension icon in any Chrome tab
2. **Expected**: Popup opens showing:
   - "🤖 Coursera Automation" header
   - Current page information
   - Control buttons (Start/Stop)
   - Feature toggles
   - Activity log

### Test 2: Non-Coursera Page
1. Go to any non-Coursera website (e.g., google.com)
2. Click extension icon
3. **Expected**: 
   - Popup opens
   - Shows "Other Website" as page type
   - "Automatable: No"
   - Start button is disabled

### Test 3: Coursera Page Testing
1. Navigate to: https://www.coursera.org
2. Click extension icon
3. **Expected**:
   - Popup opens
   - Shows "Coursera Page" as page type  
   - "Automatable: Yes"
   - Start button is enabled

### Test 4: Feature Toggles
1. In popup, click the toggle switches
2. **Expected**: 
   - Toggles switch on/off visually
   - Activity log shows "feature enabled/disabled"

### Test 5: Start Automation (on Coursera)
1. On coursera.org, click "▶️ Start Automation"
2. **Expected**:
   - Status changes to "Automation Active" with orange pulsing dot
   - Activity log shows "Automation started successfully"
   - Start button becomes disabled
   - Stop button becomes enabled

## 🐛 Debugging Steps

### If Popup Doesn't Open:
1. **Check Extension Errors**:
   - Go to `chrome://extensions/`
   - Look for any red error text under the extension
   - Click "service worker" to check background script console

2. **Check Popup Console**:
   - Right-click extension icon → "Inspect popup"
   - Look for JavaScript errors in console
   - Refresh the extension and try again

3. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Click refresh icon (🔄) on the extension
   - Try clicking the icon again

### If Content Script Issues:
1. Go to a Coursera page
2. Open Developer Tools (F12)
3. Check Console for any "[Coursera Automation]" messages
4. Look for any error messages

## 📁 Key Files

- **Manifest**: `dist/manifest.json` - Extension configuration
- **Popup**: `dist/popup-simple.html` + `dist/popup-simple.js` - Popup interface  
- **Background**: `dist/background.js` - Background service worker
- **Content**: `dist/content.js` - Injected into Coursera pages
- **Icons**: `dist/icons/icon*.png` - Extension icons

## 🔍 Expected Behavior

### On Any Website:
- Extension icon visible in toolbar
- Popup opens when clicked
- Shows current page information
- Feature toggles work

### On Coursera Website:
- All above functionality
- "Start Automation" button enabled
- Can start/stop automation
- Content script should load (check console for logs)

## 🚨 Common Issues & Solutions

### Issue: "This extension may have been corrupted"
**Solution**: Reload the extension or re-install from the dist folder

### Issue: Popup opens but buttons don't work
**Solution**: Check popup console for JavaScript errors, ensure popup-simple.js loaded

### Issue: Content script not working on Coursera
**Solution**: Check if host permissions are granted for coursera.org

### Issue: Background script not receiving messages
**Solution**: Check service worker console for errors

## ✅ Success Indicators

1. **Extension loads without errors**
2. **Popup opens reliably** 
3. **Page detection works** (shows correct page type)
4. **Feature toggles respond**
5. **Activity log updates**
6. **Automation can start on Coursera pages**

The extension is now ready for testing! Start with the basic popup functionality test and work through the Coursera-specific features.
