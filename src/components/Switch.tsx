"use client";

import React, { useState } from 'react';
import "../app/styles/Switch.css";

interface SwitchProps {
  onCategoryChange?: (category: string) => void;
}

const Switch: React.FC<SwitchProps> = ({ onCategoryChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Jiu Jitsu');

  const categories = [
    'Jiu Jitsu',
    'T.I',
    'Centro Cultural',
    'Biblioteca'
  ];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="switch-container">
      {categories.map((category) => (
        <button
          key={category}
          className={`switch-chip ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Switch;
