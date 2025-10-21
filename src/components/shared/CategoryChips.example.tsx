// EXEMPLO DE USO DO COMPONENTE CategoryChips
// Este arquivo mostra como usar o componente e como integrar com API no futuro

import React, { useState, useEffect } from "react";
import CategoryChips, { Category } from "./CategoryChips";

// Exemplo de como usar o componente
export const CategoryChipsExample: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: "jiu-jitsu", name: "Jiu Jitsu", isActive: false },
    { id: "ti", name: "T.I", isActive: false },
    { id: "centro-cultural", name: "Centro Cultural", isActive: false },
    { id: "biblioteca", name: "Biblioteca", isActive: false },
  ]);

  // Função para lidar com clique em categoria
  const handleCategoryClick = (categoryId: string) => {
    setCategories(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        isActive: category.id === categoryId ? !category.isActive : false
      }))
    );
    
    // Aqui você pode implementar a lógica para filtrar instituições
    console.log("Categoria selecionada:", categoryId);
    
    // Exemplo de como chamar API para buscar instituições por categoria:
    // fetchInstitutionsByCategory(categoryId);
  };

  // FUTURO: Função para buscar categorias da API
  const fetchCategoriesFromAPI = async () => {
    try {
      // const response = await fetch('/api/categories');
      // const data = await response.json();
      // setCategories(data.categories);
      console.log("Buscar categorias da API");
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // FUTURO: Função para buscar instituições por categoria
  const fetchInstitutionsByCategory = async (categoryId: string) => {
    try {
      // const response = await fetch(`/api/institutions?category=${categoryId}`);
      // const data = await response.json();
      // return data.institutions;
      console.log("Buscar instituições da categoria:", categoryId);
    } catch (error) {
      console.error("Erro ao buscar instituições por categoria:", error);
    }
  };

  useEffect(() => {
    // Carregar categorias da API quando o componente montar
    fetchCategoriesFromAPI();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Exemplo de Chips de Categoria</h3>
      <CategoryChips 
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
};

// TIPOS PARA INTEGRAÇÃO COM API
export interface CategoryAPI {
  id: string;
  name: string;
  description?: string;
  institutionCount?: number;
  isActive?: boolean;
}

export interface CategoryResponse {
  status: boolean;
  categories: CategoryAPI[];
  message?: string;
}

// EXEMPLO DE SERVIÇO PARA API
export class CategoryService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  static async getCategories(): Promise<CategoryResponse> {
    const response = await fetch(`${this.BASE_URL}/v1/oportunyfam/categories`);
    return response.json();
  }

  static async getInstitutionsByCategory(categoryId: string) {
    const response = await fetch(`${this.BASE_URL}/v1/oportunyfam/institutions?category=${categoryId}`);
    return response.json();
  }
}
