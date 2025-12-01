'use client';

import React, { useRef, useEffect, useState } from 'react';
import './InstitutionDateCards.css';

interface InstitutionDateCardsProps {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
}

// Ícone de seta esquerda
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// Ícone de seta direita
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const InstitutionDateCards: React.FC<InstitutionDateCardsProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(selectedDate || new Date());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Gera array de datas (30 dias antes e 60 dias depois de hoje)
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -30; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();
  const todayIndex = 30; // Índice do dia atual no array

  // Formata o dia
  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  // Formata o mês abreviado
  const formatMonth = (date: Date) => {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return months[date.getMonth()];
  };

  // Formata o dia da semana abreviado
  const formatWeekday = (date: Date) => {
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    return weekdays[date.getDay()];
  };

  // Verifica se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Verifica se está selecionado
  const isSelected = (date: Date) => {
    return date.getDate() === currentSelectedDate.getDate() &&
           date.getMonth() === currentSelectedDate.getMonth() &&
           date.getFullYear() === currentSelectedDate.getFullYear();
  };

  // Atualiza estado de scroll
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  // Centraliza na data atual quando o componente monta
  useEffect(() => {
    const centerOnToday = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll('.institution-date-card');
      
      if (cards.length === 0) return;
      
      // Encontra o card de hoje
      const todayCard = cards[todayIndex] as HTMLElement;
      if (!todayCard) return;
      
      // Calcula posição para centralizar
      const containerWidth = container.clientWidth;
      const cardLeft = todayCard.offsetLeft;
      const cardWidth = todayCard.offsetWidth;
      
      const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollLeft = scrollPosition;
      
      // Atualiza estado após scroll
      setTimeout(updateScrollState, 50);
    };

    // Aguarda renderização completa
    const timer = setTimeout(centerOnToday, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Listener de scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      updateScrollState(); // Atualiza estado inicial
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, []);

  const handleDateClick = (date: Date) => {
    setCurrentSelectedDate(date);
    onDateSelect?.(date);
  };

  const scrollBy = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 300; // Scroll de 4 cards aproximadamente
    const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="institution-date-cards-wrapper">
      <button 
        type="button"
        className="date-cards-arrow date-cards-arrow-left"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scrollBy('left');
        }}
        disabled={!canScrollLeft}
        aria-label="Datas anteriores"
      >
        <ChevronLeftIcon />
      </button>
      
      <div className="institution-date-cards-container">
        <div className="date-cards-fade date-cards-fade-left" />
        <div 
          className="institution-date-cards-scroll"
          ref={scrollContainerRef}
        >
          {dates.map((date, index) => (
            <button
              type="button"
              key={index}
              className={`institution-date-card ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className="date-weekday">{formatWeekday(date)}</span>
              <span className="date-day">{formatDay(date)}</span>
              <span className="date-month">{formatMonth(date)}</span>
            </button>
          ))}
        </div>
        <div className="date-cards-fade date-cards-fade-right" />
      </div>
      
      <button 
        type="button"
        className="date-cards-arrow date-cards-arrow-right"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scrollBy('right');
        }}
        disabled={!canScrollRight}
        aria-label="Próximas datas"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

export default InstitutionDateCards;
