# FreeFanRadio.ca - Layout Design Documentation

## Overview
This document captures the key design decisions made for the FreeFanRadio.ca mobile-optimized landing page.

## Design Goals
- **Mobile-First**: Optimized for smartphone usage (especially Pixel 7 form factor)
- **One-Tap Access**: Immediate radio streaming with minimal interaction
- **No Scrolling**: Everything fits within viewport without scrolling
- **Persistent History**: Remember user's last 8 played stations
- **Clean & Minimal**: Focus purely on functionality

## Layout Architecture

### Header (64px fixed)
```
┌─────────────────────────────────────────┐
│ [☰] FreeFanRadio.ca    [Navigation]    │ ← Fixed header, always visible
└─────────────────────────────────────────┘
```
- **Position**: `fixed` at top
- **Height**: Exactly 64px
- **Content**: Site branding + hamburger menu navigation
- **Visibility**: Always visible (provides site navigation)

### Main Content Area
```
┌─────────────────────────────────────────┐
│ Fixed Header (64px)                     │
├─────────────────────────────────────────┤ ← top: 64px
│ Main Content (position: fixed)          │
│  ┌─────────────────────────────────────┐ │
│  │ Stations Container                  │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ 8-Slot Station Grid             │ │ │
│  │  │  ┌─────┬─────┐  (Mobile 2x4)    │ │ │
│  │  │  │ Sta │ Sta │                  │ │ │
│  │  │  ├─────┼─────┤                  │ │ │
│  │  │  │ Sta │ Sta │                  │ │ │
│  │  │  ├─────┼─────┤                  │ │ │
│  │  │  │ Sta │ Sta │                  │ │ │
│  │  │  ├─────┼─────┤                  │ │ │
│  │  │  │ Bro │ Bro │ ← "Browse All"   │ │ │
│  │  │  └─────┴─────┘                  │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘ ← bottom: 0
│ Audio Player (when active)              │ ← Fixed overlay
└─────────────────────────────────────────┘
```

### CSS Positioning Strategy
```css
.main-content {
    position: fixed;
    top: 64px;      /* Start below header */
    left: 0;
    right: 0;
    bottom: 0;      /* Stretch to viewport bottom */
    overflow: hidden;
}
```

## Grid Layout

### Responsive Breakpoints
- **Mobile (< 768px)**: 2 columns × 4 rows
- **Desktop (≥ 768px)**: 4 columns × 2 rows

### Station Card Design Evolution

#### Final Design (Current)
```css
.station-slot {
    /* Entire card is clickable button */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    /* Contains only station name */
}
```

#### What We Removed
- ❌ Separate "Play Live" buttons (hard to tap on mobile)
- ❌ Frequency tags ("690 AM")
- ❌ Location tags ("Montreal, QC")
- ❌ Genre tags ("Sports Talk")
- ❌ Last played timestamps
- ❌ Verbose descriptions

#### Why We Simplified
1. **Mobile Touch Targets**: Entire card > small button
2. **Screen Real Estate**: More room for essential info
3. **Cognitive Load**: Less text = faster recognition
4. **Pixel 7 Form Factor**: Smaller buttons were problematic

## Audio Player Integration

### The Overlap Problem
**Issue**: Fixed audio player at bottom covered station buttons

**Solution**: Dynamic padding based on player state
```css
.stations-container.player-active {
    padding-bottom: 100px; /* Mobile: 4 rows need more space */
}

@media (min-width: 768px) {
    .stations-container.player-active {
        padding-bottom: 90px; /* Desktop: 2 rows need less space */
    }
}
```

### Detection Mechanism
```javascript
// MutationObserver watches for audio player class changes
const observer = new MutationObserver((mutations) => {
    if (mutation.attributeName === 'class') {
        updateLayoutForPlayer(); // Adjust padding
    }
});
```

## Station Data Management

### Storage Strategy
- **LocalStorage Key**: `freefanradio_recent_stations`
- **Max Stations**: 8
- **Data Structure**:
```json
{
  "name": "TSN 690 Montreal",
  "url": "https://...",
  "frequency": "690 AM",
  "location": "Montreal, QC", 
  "genre": "Sports Talk",
  "lastPlayed": "2025-09-28T20:30:00.000Z"
}
```

### Display vs Storage Order
- **Storage**: Recency order (newest first)
- **Display**: Alphabetical order (consistent positioning)
- **Rationale**: Prevents UI elements from moving around when user selects stations

## Empty Slot Strategy

### "Browse All" Button Positioning Evolution

#### Problem 1: Button too low
- Empty slots had centered content
- "Browse All" button appeared in middle/bottom
- Got hidden behind audio player

#### Problem 2: Verbose text
- Had explanatory text "Play a station to see it here"
- Took up space and pushed button down
- Made button less visible

#### Final Solution: "Roofed" Button
```html
<div class="empty-slot-content">
    <button class="browse-btn">Browse All</button>  <!-- Top -->
    <i class="fas fa-radio"></i>                    <!-- Bottom -->
</div>
```

```css
.empty-slot-content {
    justify-content: flex-start; /* Align to top */
    padding-top: 1rem;          /* Safe distance from edge */
}

.browse-btn {
    margin-bottom: auto;        /* Push to top */
}
```

## Key Technical Decisions

### 1. Fixed Positioning Over Height Calculations
**Why**: Cross-browser viewport height inconsistencies
```css
/* ❌ Problematic approach */
height: calc(100vh - 64px);

/* ✅ Reliable approach */
position: fixed;
top: 64px;
bottom: 0;
```

### 2. MutationObserver Over Polling
**Why**: More efficient than `setInterval()` checking
```javascript
// Watches for class changes on audio player element
observer.observe(audioPlayer, {
    attributes: true,
    attributeFilter: ['class']
});
```

### 3. Flexbox Over CSS Grid for Containers
**Why**: Better for dynamic height adjustment
- Grid: Fixed dimensions
- Flex: Adapts to available space

### 4. Direct Property Storage Over JSON Attributes
**Why**: Avoids JSON parsing errors with special characters
```javascript
// ❌ Problematic
button.dataset.station = JSON.stringify(station);

// ✅ Reliable  
button.stationData = station;
```

## Performance Considerations

### Minimal DOM Manipulation
- Station grid regenerated only when data changes
- Audio player state checked via class observation
- No continuous polling or heavy operations

### CSS Transitions
- Smooth `padding-bottom` transition when player appears
- Hardware-accelerated transforms for hover effects
- Minimal reflow/repaint operations

## Accessibility Features

### Keyboard Navigation
- All interactive elements are focusable
- Space bar plays/pauses current station
- Tab navigation through station grid

### Touch Targets
- Minimum 44px touch targets (entire station cards)
- Adequate spacing between interactive elements
- Visual feedback on tap/hover

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive button text

## Future Considerations

### Potential Enhancements
1. **Drag & Drop Reordering**: Let users manually organize stations
2. **Custom Station Names**: Allow renaming for personalization
3. **Favorites System**: Star/heart system beyond recent history
4. **Offline Mode**: Cache station metadata for offline browsing

### Scalability Notes
- Design supports 8 stations optimally
- Could extend to 12 (3×4 mobile, 6×2 desktop)
- Beyond 12 would require pagination or scrolling

## Browser Support
- **Target**: Modern mobile browsers (iOS Safari, Chrome Android)
- **Fallbacks**: CSS Grid falls back to flexbox
- **Progressive Enhancement**: Works without JavaScript (basic navigation)

---

**Last Updated**: September 28, 2025  
**Version**: 1.0 - Mobile-Optimized Launch