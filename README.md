# Naada (නාද) — Modern Sinhala Guitar Chords & Jam PWA

> **නාද** (Naada): Tone, musical resonance. An editorial, mobile-first Web Application for Sinhala Guitar Chords featuring live mic-aware auto-scrolling, synthesized rhythm strumming loops, and real-time synchronized jam rooms.

---

## 🎨 Visual Identity & Editorial Design

- **Clean White & Electric Violet**: Crisp white (`#ffffff`) surfaces paired with soft lavender tints (`#faf5ff`, `#f5f3ff`) and electric purple highlights (`#7c3aed`, `#6d28d9`).
- **Pristine Unicode & Romanized Typography**: Clean pairing of **Noto Sans Sinhala** for authentic Sinhala typography and **Plus Jakarta Sans / Inter** for modern editorial precision.
- **Indivisible Syllable Units**: Chords are locked directly above lyrics in unbreakable inline-flex tokens, ensuring chords never separate from their corresponding words during responsive text wrapping on narrow mobile screens.
- **Interactive Chord Library**: Tap any chord symbol to open an interactive SVG fretboard diagram with string markers, finger dots, and open/muted string indicators.

---

## 🚀 Core Features

### 1. Responsive ChordPro Engine (`<SongViewer />`)
- Structured parsing of standard ChordPro markup (`[G]ගමෙන් ලියුමක් [C]ඇවිල්ලා`).
- **Dynamic Semitone Shifter**: Real-time pitch transposition (`-1`, `+1`, Reset) recalculating roots across sharp and flat scales (`G#m7`, `F#m`, `Bb`, `Cadd9`).
- **Intelligent Capo Advisor**: Analyzes root note and recommends the optimal capo fret to play with open, easy chord shapes (e.g. *"Capo on fret 1 to play in D open shapes"*).
- **1-Click Singlish Switcher**: Instantly toggle between Sinhala Unicode and Romanized Singlish with zero horizontal layout shift.
- **Dual Perspective Modes**:
  - **Musician View**: Full chords, pitch transposition, capo advice, and rhythm tools.
  - **Singer / Paduru View**: Chords cleanly hidden, presenting extra-large, centered lyric typography for friends singing along.

### 2. Native Web Audio Strum Synthesizer (`useStrumPlayer`)
- In-browser acoustic guitar strum synthesis using native Web Audio API (`AudioContext`, `GainNode`, `BiquadFilterNode`, buffer sources) with zero external audio assets required.
- **Acoustic Down-Strum**: Layered noise bursts with decaying bandpass body resonance (380 Hz) and string fundamental oscillator.
- **Crisp Up-Strum**: High-passed transients (850 Hz) with rapid envelope decay.
- **Sri Lankan Rhythm Presets**:
  - **Baila 6/8**: `↓ . ↑ ↓ ↑ .` (Heavy accents on beats 1 & 4, Sri Lankan baila groove)
  - **Calypso 4/4**: `↓ . ↓ ↑ . ↑ ↓ ↑`
  - **Sarala Gee 3/4**: `↓ . ↓ . ↓ .` (Gentle waltz strum)
  - **Pop Ballad 4/4**: `↓ . ↓ ↑ . ↑ ↓ .`
- Tempo control (50–180 BPM) with real-time pulsing rhythm beat indicators.

### 3. Mic-Aware Smart Auto-Scroller (`useMicAutoScroll`)
- Real-time acoustic energy detection via `navigator.mediaDevices.getUserMedia({ audio: true })` and `AnalyserNode`.
- Computes RMS volume in `requestAnimationFrame`.
- **Silence Detection**: Automatically pauses scrolling if acoustic strumming drops below the threshold for > 1.5 seconds. Instantly resumes scrolling as soon as guitar playing restarts.
- Glowing violet/emerald indicator dot on the floating dock representing live sensitivity and detected sound.

### 4. "Paduru Party" Realtime Jam Rooms (`useJamRoom`)
- Multi-device sync powered by Supabase Realtime Broadcast channels (`jam-room:[code]`) with local fallback channel.
- Host starts a jam and shares an easy 4-character code (e.g. `NA42`).
- Real-time broadcast events:
  - `song-change`: Navigates all connected devices to the active chart.
  - `scroll-sync`: Broadcasts host scroll offset percentage so everyone's screen moves together.

### 5. Mobile Device Screen Wake Lock (`useWakeLock`)
- Utilizes `navigator.wakeLock.request('screen')` to prevent performers' mobile devices from dimming or falling asleep mid-song.

---

## 🗄 Database Schema (Supabase / PostgreSQL)

See [`supabase/schema.sql`](file:///C:/Users/yasas/DATA/Naada/supabase/schema.sql):
- `songs`: `id`, `title_si`, `title_en`, `artist`, `key`, `tempo_bpm`, `time_signature`, `strum_pattern`, `content_chordpro`, `content_singlish`.
- `jam_rooms`: `room_code`, `host_id`, `current_song_id`, `created_at`.
- Includes seed records for:
  1. **Clarence Wijewardena** - *Gamen Liyumak* (Baila 6/8, Key: G)
  2. **Milton Mallawarachchi** - *Ran Kuduwe* (Pop Ballad 4/4, Key: C)
  3. **Kasun Kalhara** - *Mal Mitak Thiyanna* (Sarala Gee 3/4, Key: Dm)
  4. **Gunadasa Kapuge** - *Dawasak Pala Nathi Hene* (Key: Am)

---

## 🛠 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to launch **Naada**.

---

Crafted with ❤️ by **Elio Dredd** for Sri Lankan music lovers worldwide.
