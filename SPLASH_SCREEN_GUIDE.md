# Splash Screen Configuration

The app now has a properly configured splash screen for Android (and iOS).

## What Was Added

### 1. Configuration in `app.json`

```json
{
  "expo": {
    "splash": {
      "image": "./assets/images/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "splash": {
        "image": "./assets/images/icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "splash": {
        "image": "./assets/images/icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### 2. Splash Screen Control in Code

The splash screen is controlled in `app/_layout.tsx`:

- **Prevents auto-hide** on app start
- Shows splash screen for 1 second minimum
- Hides automatically once app is ready

## How It Works

1. **App Launch**: Splash screen displays immediately using your app icon
2. **Background Color**: White background (#ffffff)
3. **Icon Display**: Icon is centered and contained within the screen
4. **Duration**: Shows for at least 1 second while app initializes
5. **Auto Hide**: Disappears once the app layout is ready

## Customization Options

### Change Background Color

Edit the `backgroundColor` in `app.json`:

```json
"splash": {
  "backgroundColor": "#000000"  // Black background
}
```

### Change Resize Mode

Options: `contain`, `cover`, `native`

```json
"splash": {
  "resizeMode": "cover"  // Fill entire screen
}
```

### Use Different Image

Replace `./assets/images/icon.png` with your custom splash screen image:

```json
"splash": {
  "image": "./assets/images/splash.png"
}
```

**Recommended Image Sizes:**
- **Android**: 1242 × 2436 px (portrait) or larger
- **iOS**: 2048 × 2732 px (portrait) or larger
- **Format**: PNG with transparency

### Adjust Display Duration

Modify the timeout in `app/_layout.tsx`:

```typescript
// Current: 1 second
await new Promise(resolve => setTimeout(resolve, 1000));

// Change to 2 seconds
await new Promise(resolve => setTimeout(resolve, 2000));

// Or remove delay entirely for instant hide
await new Promise(resolve => setTimeout(resolve, 0));
```

## Platform-Specific Behavior

### Android
- Uses adaptive icon system
- Splash screen follows Material Design guidelines
- Background color applies to status bar area

### iOS
- Uses launch storyboard
- Supports all device sizes automatically
- Background color fills safe area

## Troubleshooting

### Splash Screen Not Showing

1. Rebuild the app (splash screens require native rebuild)
2. Verify image path is correct in `app.json`
3. Check image file exists at specified path

### Splash Screen Flickers

- Increase the delay in `app/_layout.tsx`
- Ensure fonts and assets are loaded before hiding splash

### Wrong Colors/Image

- Clear build cache: `expo prebuild --clean`
- Rebuild the app completely

## Notes

- Splash screen configuration requires a **full rebuild** of the native app
- Changes to splash screen settings in `app.json` won't appear until you rebuild
- Web platform doesn't use native splash screens (uses loading indicator instead)
