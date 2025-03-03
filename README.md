# SoulGatchi - Islamic Virtual Pet

SoulGatchi is a minimalist Islamic-themed virtual pet web application inspired by the classic Tamagotchi. Instead of traditional feeding and playing, your virtual pet grows through Islamic practices like dhikr (remembrance of Allah), prayer, and learning.

## Features

- **Dark Mode Interface**: Clean, minimalist design with a dark theme
- **Islamic Interactions**: Nurture your pet through dhikr, prayer, rest, and Islamic learning
- **Persistent State**: Your pet's state is saved in the browser's local storage
- **Responsive Design**: Works on mobile and desktop devices
- **Progressive Web App (PWA)**: Can be installed on mobile devices and used offline
- **Incremental Growth**: Your pet grows as you perform more spiritual practices
- **Dhikr Counter**: Gain increasing benefits the more you recite each dhikr
- **Decay Timer**: Stats gradually decrease over time, encouraging regular interaction
- **Haptic Feedback**: Subtle vibrations when interacting with buttons on mobile devices

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. Name your SoulGatchi when you first start
2. Grow your pet's health, spirituality, energy, and happiness by:
   - Performing dhikr (remembrance of Allah)
   - Praying the five daily prayers
   - Allowing your pet to rest
   - Learning Islamic knowledge
3. Your pet's mood will change based on its stats
4. Stats will gradually decrease every 10 seconds if you don't interact
5. If health or spirituality drops to zero, your pet will pass away
6. When all stats reach 100%, your pet achieves enlightenment!

## Dhikr Mechanic

SoulGatchi features a special dhikr system that encourages repeated recitation:

- Each type of dhikr provides different benefits:
  - **Subhanallah** (Glory be to Allah): Primarily increases spirituality
  - **Alhamdulillah** (Praise be to Allah): Primarily increases happiness
  - **Allahu Akbar** (Allah is the Greatest): Primarily increases energy
  - **Astaghfirullah** (I seek forgiveness from Allah): Primarily restores health

- The more you recite each dhikr, the greater the benefits:
  - Every 10 recitations adds a bonus to the benefits
  - You can see your recitation count for each dhikr
  - This encourages consistent practice of dhikr

## Decay Timer

To simulate the need for consistent spiritual practice:

- A countdown timer shows when the next decay will occur (every 10 seconds)
- Each decay reduces all stats by a small amount
- Any interaction with your pet resets the decay timer
- This mechanic encourages regular engagement with Islamic practices

## Haptic Feedback

On supported mobile devices, SoulGatchi provides subtle haptic feedback:

- Gentle vibrations when tapping on buttons and tabs
- Medium vibration when interacting directly with your pet
- Creates a more immersive and engaging experience
- Works on most modern smartphones that support the Vibration API

## Islamic Elements

- **Dhikr**: Recite phrases like "Subhanallah" (Glory be to Allah) and "Alhamdulillah" (Praise be to Allah)
- **Prayer**: Perform the five daily prayers plus Tahajjud (night prayer)
- **Learning**: Study the Quran, Hadith, Fiqh (Islamic jurisprudence), and Islamic history

## PWA Installation

SoulGatchi can be installed as a Progressive Web App on your mobile device:

1. Open the website in your mobile browser
2. For iOS: Tap the Share button, then "Add to Home Screen"
3. For Android: Tap the menu button, then "Add to Home Screen" or "Install App"

Once installed, SoulGatchi can be used offline and will appear as an app on your device.

## License

MIT
