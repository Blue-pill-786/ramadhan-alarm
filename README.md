🌙 Ramadhan Dashboard

Live App: https://iftaar.netlify.app/

A modern, real-time Ramadhan prayer dashboard built with React + TypeScript + Vite.

This application calculates prayer timings, Sehri/Iftar countdowns, and Tahajjud start time with accurate night-boundary logic and real-time progress visualization.

✨ Features
🕒 Real-Time Prayer Engine

Live countdown updating every second

Accurate Islamic day rollover handling

Midnight boundary-safe logic

Strict chronological ordering of prayer times

🌅 Sehri & 🌇 Iftar Countdown

Automatically switches between Sehri and Iftar mode

Ring fills based on time remaining

Smooth animated circular progress

🌌 Tahajjud Calculation

Tahajjud is calculated using:

Night Duration = Maghrib → Next Fajr
Tahajjud Start = Maghrib + (2/3 × Night Duration)

Works correctly across midnight transitions.

🕌 Current Prayer Indicator

Dynamically detects current prayer

Displays progress ring for active prayer

Real-time update logic

🎨 UI & Experience

Dynamic gradient sky themes based on current prayer

Glassmorphism card design

Responsive layout

Animated loading state

Smooth ring transitions

🛠 Tech Stack

React

TypeScript

Vite

Custom CSS (no UI framework)

Aladhan Prayer Times API

Netlify Deployment

📍 How It Works

User grants location permission.

App fetches prayer timings from Aladhan API.

usePrayerEngine:

Anchors prayer times to client timezone

Correctly handles Islamic day rollover

Calculates current prayer

Computes Tahajjud start

Determines Sehri/Iftar state

Updates progress every second

UI reacts instantly to time changes.

⚙️ Installation

Clone the repository:

git clone https://github.com/your-username/ramadhan-dashboard.git
cd ramadhan-dashboard

Install dependencies:

npm install

Run locally:

npm run dev

Build for production:

npm run build

Preview production build:

npm run preview
🌍 Deployment

This project is deployed on Netlify.

To deploy:

Connect repository to Netlify

Build command: npm run build

Publish directory: dist

Make sure browser geolocation permissions are enabled.

🧠 Technical Challenges Solved

Midnight rollover errors

Next Fajr miscalculation

Night duration calculation accuracy

Deployment timezone mismatch

Live progress ring logic

Strict chronological time ordering

🚀 Future Improvements

Prayer notification reminders

Multiple calculation methods

Ramadan progress tracker

Qibla direction compass

Offline caching support

Multi-location support

📜 License

MIT License