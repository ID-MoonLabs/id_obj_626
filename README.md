# AI Assistant Chat Interface

A modern AI chat interface built with Next.js, React, Tailwind CSS, and TypeScript with Server-Side Rendering (SSR) support. The interface features a clean, minimalist black and white design aesthetic.

## Features

- **Server-Side Rendering (SSR)**: Fully server-rendered with Next.js
- **Black & White Theme**: Minimalist color scheme with only black and white
- **Responsive Design**: Works on all device sizes
- **Real-time Chat**: Interactive messaging interface
- **Loading States**: Animated typing indicators
- **Message Timestamps**: Shows when messages were sent
- **Auto-scrolling**: Messages automatically scroll to latest

## Technologies Used

- **Next.js 14**: React framework with SSR support
- **React 18**: Component-based UI library
- **TypeScript**: Strongly typed JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: For state management

## Getting Started

### Prerequisites

- Node.js 16.14 or later
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Project Structure

```
.
├── src/
│   ├── app/                # Next.js app router
│   │   ├── page.tsx        # Main chat page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   └── components/         # Reusable components
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Design Principles

The interface follows these design principles:
1. **Minimalist**: Only black and white color scheme with subtle gray accents
2. **Clean**: Ample whitespace and simple typography
3. **Functional**: All UI elements serve a clear purpose
4. **Responsive**: Adapts to all screen sizes
5. **User-Friendly**: Intuitive chat experience with visual feedback

## Implementation Details

### React Components

The chat interface consists of:
- Header with title and user avatar
- Message bubbles with distinct styling for user and assistant
- Input area with send button
- Loading indicators when waiting for responses

### State Management

The component uses React's `useState` and `useEffect` hooks:
- `messages`: Array of conversation messages
- `inputValue`: Current text input
- `isLoading`: Loading state for AI responses

### Styling

Tailwind CSS is configured with:
- Black and white color palette as primary colors
- Custom rounded message bubbles
- Smooth animations and transitions
- Responsive design for all screen sizes

## Server-Side Rendering (SSR)

This application uses Next.js's Server-Side Rendering capabilities:
- Initial page load is rendered on the server
- React components are hydrated on the client
- SEO-friendly with pre-rendered content
- Better performance for first contentful paint

## TypeScript Integration

All components are written in TypeScript with:
- Strict type checking
- Type-safe props and state
- Interface definitions for message objects
- Automated error detection

## License

This project is licensed under the MIT License.