Precious Metals Live Prices
A React Native Expo app that displays live prices for Gold, Silver, Platinum, and Palladium with automatic updates and detailed views.

Features
Home Screen

Shows all four metals in a grid.

Automatic price updates every 3 seconds.

Displays current time and update counter.

Tap a metal to navigate to its details.

Details Screen

In-depth metrics: open, high, low, previous close.

24-karat conversions (per gram, per 10 grams).

Live streaming status and “time since update.”

Manual refresh button and loading spinner.

Auto-refresh every 3 seconds with cleanup.

Setup & Run
Clone the repository:

bash
git clone https://github.com/yourusername/precious-metals-app.git
cd precious-metals-app
Install dependencies:

bash
npm install
# or
yarn
Start Expo (clear cache):

bash
npx expo start --clear
Open in Expo Go by scanning the QR code, or run on simulator:

Android: press a

iOS: press i

Web: press w

Approach & Architecture
Polling Strategy

Used a recursive setTimeout inside useEffect for stable intervals without stale closures.

Maintained an updateCount state to force FlatList re-renders via its extraData prop.

Separation of Concerns

HomeScreen in src/screens/HomeScreen.js handles list display and auto-refresh.

DetailsScreen in src/screens/DetailsScreen.js handles individual metal data, manual and auto-refresh, scroll position preservation, and styling.

React Navigation

Stack navigator for Home and Details routes in App.js.

Mock API

fetchMetalPrice generates realistic price fluctuations, error simulations, and returns historical fields.

Challenges & Notes
Expo Entry Point

Discovered that Expo uses App.js at project root; moved screen code into src/screens/.

Auto-Refresh in Expo Go

Initial attempts with setInterval led to stale state; switched to setTimeout pattern.

Rendering Objects

Fixed errors by rendering primitive properties (metal.name, metal.price, etc.) instead of whole objects.

Memory Management

Ensured all timers are cleared on component unmount to prevent leaks.
