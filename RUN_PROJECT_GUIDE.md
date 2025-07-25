# Complete Project Setup & Real-World Testing Guide

## Prerequisites

Before starting, ensure you have:
- Chrome browser installed
- Node.js and npm installed
- Python 3.x installed (for backend)
- Internet connection for Coursera access

## Step 1: Project Setup

### 1.1 Start the Backend Server
```bash
# Navigate to project directory
cd /Users/infantai/Projects/nerubrain

# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Start the FastAPI backend server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
**Expected Output**: Server running at http://127.0.0.1:8000

### 1.2 Start the Frontend Development Server
```bash
# In a new terminal window
cd /Users/infantai/Projects/nerubrain

# Install npm dependencies (if not already done)
npm install

# Start webpack in watch mode for development
npm run dev

# OR build for production
npm run build
```
**Expected Output**: Webpack compiled successfully, files generated in `dist/` folder

## 🔧 Step 2: Load Extension in Chrome

### 2.1 Enable Developer Mode
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right corner)

### 2.2 Load the Extension
1. Click "Load unpacked" button
2. Navigate to and select: `/Users/infantai/Projects/nerubrain/dist`
3. Click "Select Folder"

### 2.3 Verify Installation
✅ Extension appears with blue circular icon
✅ Extension shows "No errors" 
✅ Icon appears in Chrome toolbar (may need to pin it)

## 🧪 Step 3: Basic Testing

### 3.1 Test Popup on Any Website
1. Go to `google.com`
2. Click the extension icon
3. **Expected Result**:
   - Popup opens immediately
   - Shows "Other Website" as page type
   - "Automatable: No"
   - Start button is disabled

## 🎯 Step 4: Real Coursera Testing

### 4.1 Navigate to Coursera
Open these Coursera pages for testing:
- **Main page**: https://www.coursera.org
- **Browse courses**: https://www.coursera.org/browse
- **Free course example**: https://www.coursera.org/learn/machine-learning

### 4.2 Test Extension on Coursera Home Page
1. Go to https://www.coursera.org
2. Click extension icon
3. **Expected Result**:
   - Popup opens
   - Shows "Coursera Page" as page type
   - "Automatable: Yes" 
   - Start button is ENABLED
   - Activity log shows page detection

### 4.3 Test Feature Toggles
1. In popup, click each toggle switch:
   - Quiz Automation
   - Video Automation  
   - Reading Automation
2. **Expected Result**:
   - Toggles switch on/off visually
   - Activity log shows "feature enabled/disabled"

### 4.4 Test Start Automation
1. On coursera.org, click "▶️ Start Automation"
2. **Expected Result**:
   - Status changes to "Automation Active" (orange pulsing dot)
   - Activity log shows "Automation started successfully"
   - Start button becomes disabled
   - Stop button becomes enabled

## 🎓 Step 5: Advanced Real-World Testing

### 5.1 Test on Actual Course Content

#### Find a Free Course:
1. Go to https://www.coursera.org/browse
2. Filter by "Free" courses
3. Enroll in any free course (no payment required)
4. Navigate to course content

#### Test on Different Content Types:

**A. Video Lecture Testing:**
```
1. Find a video lecture in the course
2. Click extension icon
3. Start automation
4. Expected: Video should auto-play and speed up
```

**B. Quiz Testing:**
```
1. Find a quiz or practice exercise
2. Click extension icon  
3. Start automation
4. Expected: Quiz questions should be automatically answered
```

**C. Reading Material Testing:**
```
1. Find reading material/articles
2. Click extension icon
3. Start automation  
4. Expected: Reading should be marked as completed
```

### 5.2 Monitor Background Activity

#### Check Background Console:
1. Go to `chrome://extensions/`
2. Find "Coursera Automation Extension"
3. Click "service worker" to open background console
4. Look for `[Coursera Automation]` log messages

#### Check Content Script Console:
1. On any Coursera page, press F12
2. Check Console tab for messages
3. Look for content script initialization logs

## 🔍 Step 6: Debug & Monitor

### 6.1 Backend API Testing
```bash
# Test backend endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/courses
```

### 6.2 Extension Error Checking
1. **Popup Errors**: Right-click extension icon → "Inspect popup"
2. **Background Errors**: Check service worker console
3. **Content Script Errors**: Check page console on Coursera

### 6.3 Real-time Monitoring
```bash
# Monitor backend logs
tail -f backend/logs/app.log

# Watch webpack rebuild
npm run dev
```

## 📊 Step 7: Performance Testing

### 7.1 Test Automation Speed
1. Time how long automation takes on different content types
2. Monitor CPU/memory usage during automation
3. Test on multiple courses simultaneously

### 7.2 Test Error Handling
1. **Network Issues**: Disconnect internet during automation
2. **Page Changes**: Navigate away during automation
3. **Permissions**: Test without host permissions

## 🎯 Step 8: Production Testing Scenarios

### Scenario A: Complete Course Automation
```
1. Enroll in a short free course
2. Start automation from course home page
3. Let it run through all modules
4. Verify completion tracking
```

### Scenario B: Selective Feature Testing
```
1. Disable quiz automation
2. Enable only video automation
3. Test on mixed content course
4. Verify only videos are automated
```

### Scenario C: Multi-tab Testing
```
1. Open multiple Coursera courses in different tabs
2. Start automation in each tab
3. Verify independent operation
4. Check for conflicts or interference
```

## 🚨 Troubleshooting Common Issues

### Issue: Extension not loading
```bash
# Rebuild extension
npm run clean && npm run build

# Reload in Chrome
1. Go to chrome://extensions/
2. Click refresh icon on the extension
```

### Issue: Popup not opening
```bash
# Check for errors
1. Check extension console for errors
2. Verify all files exist in dist/
3. Check manifest.json syntax
```

### Issue: Content script not working
```bash
# Verify permissions
1. Check host permissions granted
2. Reload Coursera page
3. Check console for injection errors
```

### Issue: Backend not responding
```bash
# Restart backend
pkill -f uvicorn
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## ✅ Success Criteria

The project is working correctly when:

1. **✅ Extension loads without errors**
2. **✅ Popup opens on all websites** 
3. **✅ Correctly detects Coursera vs non-Coursera pages**
4. **✅ Feature toggles respond**
5. **✅ Can start automation on Coursera**
6. **✅ Background/content scripts communicate**
7. **✅ Backend API responds**
8. **✅ Automation actually works on course content**

## 🎯 Real-World Testing Checklist

- [ ] Extension icon appears in Chrome toolbar
- [ ] Popup opens reliably on any website
- [ ] Detects Coursera pages correctly
- [ ] Feature toggles work
- [ ] Can start automation on Coursera
- [ ] Backend server running and accessible
- [ ] Content scripts inject into Coursera pages
- [ ] Automation works on video content
- [ ] Automation works on quiz content  
- [ ] Automation works on reading material
- [ ] Progress tracking functions
- [ ] Error handling works
- [ ] Multi-tab support works

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start backend
cd /Users/infantai/Projects/nerubrain
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Build extension  
cd /Users/infantai/Projects/nerubrain
npm run build

# Then load dist/ folder in Chrome extensions
```

You're now ready to test the full functionality on real Coursera content!
