"use client";

import React from "react";
import styles from "../../app/styles/CategoryChips.module.css";

export interface Category {
  id: string;
  name: string;
  isActive?: boolean;
}

interface CategoryChipsProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className={styles.chipsContainer}>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${styles.chip} ${category.isActive ? styles.chipActive : ''}`}
          onClick={() => onCategoryClick(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryChips;
