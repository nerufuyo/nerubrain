# 🎯 IMMEDIATE TESTING INSTRUCTIONS

## 🚀 Quick Start (5 minutes)

### Step 1: Load Extension (2 minutes)
```
1. Open Chrome browser
2. Go to: chrome://extensions/
3. Turn ON "Developer mode" (toggle top-right)
4. Click "Load unpacked"
5. Select folder: /Users/infantai/Projects/nerubrain/dist
6. ✅ Extension loads with blue circular icon
```

### Step 2: Test Basic Functionality (1 minute)
```
1. Click extension icon on ANY website
2. ✅ Popup should open immediately
3. ✅ Shows page information and controls
```

### Step 3: Test on Coursera (2 minutes)
```
1. Go to: https://www.coursera.org/learn/machine-learning
2. Click extension icon
3. ✅ Should show "Coursera Page" and "Automatable: Yes"
4. ✅ "Start Automation" button should be ENABLED
```

## 🎓 Real Course Testing

### Option A: Test with Free Course
```
1. Go to: https://www.coursera.org/learn/machine-learning
2. Click "Enroll for Free" (no payment required)
3. Navigate to first video lesson
4. Click extension icon → Start Automation
5. ✅ Video should auto-play and speed up
```

### Option B: Test with Course Preview
```
1. Browse courses at: https://www.coursera.org/browse
2. Click any course → "Preview this course"
3. Click extension icon → Start Automation
4. ✅ Should attempt to automate available content
```

## 🔍 Debug if Issues

### If Popup Won't Open:
```
1. Go to chrome://extensions/
2. Click "Errors" if shown under extension
3. Click refresh icon (🔄) on extension
4. Try again
```

### If Extension Shows Errors:
```
1. Check that all files exist in dist/ folder
2. Reload extension
3. Check browser console for errors
```

## ✅ Success Checklist

- [ ] Extension loads without errors
- [ ] Popup opens on any website  
- [ ] Detects Coursera vs non-Coursera pages
- [ ] Start button enabled on Coursera
- [ ] Feature toggles work
- [ ] Activity log updates

## 🎯 Expected Results

### On Google.com:
- Page Type: "Other Website"
- Automatable: "No" 
- Start button: DISABLED

### On Coursera.org:
- Page Type: "Coursera Page"
- Automatable: "Yes"
- Start button: ENABLED

### When Starting Automation:
- Status: Changes to "Automation Active" (orange dot)
- Log: Shows "Automation started successfully"
- Buttons: Start disabled, Stop enabled

## 🚨 If Something Doesn't Work

### Quick Fixes:
1. **Reload extension**: chrome://extensions/ → click refresh
2. **Clear cache**: Hard refresh Coursera page (Cmd+Shift+R)
3. **Check permissions**: Make sure coursera.org is allowed

### Get Help:
1. Check extension console for errors
2. Check page console on Coursera for logs
3. Verify all files exist in dist/ folder

---

**🎯 The extension is ready! Start with Step 1 above.**
