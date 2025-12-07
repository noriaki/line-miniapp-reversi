import React from 'react';
import GameBoard from '@/components/GameBoard';

/**
 * Game Page (Server Component)
 * Generates static HTML and mounts the GameBoard Client Component
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-line-light text-gray-900">
      {/* Header */}
      <header className="w-full bg-line-green text-white py-4 px-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">リバーシ</h1>
      </header>

      {/* Game Content */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <GameBoard />
      </div>
    </main>
  );
}
