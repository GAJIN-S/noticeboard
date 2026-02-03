# Interactive Investigation Board

A digital investigation board ("cork board") application built with React, Konva, and Firebase.

## Features

- **Infinite Canvas**: Zoom and pan freely to organize your evidence.
- **Tools**:
    - **Sticky Notes**: Add text notes anywhere.
    - **Images**: Drag & Drop or upload images.
    - **Red Strings**: visually connect items with dynamic lines.
    - **Pen/Eraser**: Freehand drawing on the board.
- **Board Management**: Create multiple boards, auto-saved to cloud.
- **Collaboration**: Share links (Public/Private modes supported via Firestore rules).

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Firebase Account

### 1. Installation

```bash
npm install
```

### 2. Firebase Configuration

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google Provider).
3. Enable **Firestore Database**.
4. Enable **Storage**.
5. Copy your firebase config keys into a `.env` file (see `.env.example`).

**Note**: Since this is a client-side app, you must allow public read/write or setup authentication in the app. The provided code assumes you will set up keys.

### 3. Run Locally

```bash
npm run dev
```

## Tech Stack
- React + Vite
- Tailwind CSS
- React Konva (Canvas)
- Zustand (State Management)
- Firebase (Auth, Firestore, Storage)
