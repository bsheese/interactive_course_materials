import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC<{ message?: string }> = ({
  message = "That page isn't part of this site.",
}) => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] font-sans px-6">
    <div className="max-w-md text-center space-y-3">
      <Compass className="w-8 h-8 text-[#E67E22] mx-auto" />
      <h1 className="text-xl font-serif font-bold tracking-tight">Nothing here</h1>
      <p className="text-sm text-[#555555] leading-relaxed">{message}</p>
      <Link
        to="/"
        className="inline-block text-xs font-bold text-white bg-[#1A1A1A] hover:bg-[#333333] px-4 py-2 rounded-sm transition-colors"
      >
        Browse all modules
      </Link>
    </div>
  </div>
);
