// src/components/Column.tsx
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import styled from 'styled-components';
import Card
 from './Card';
interface ColumnProps {
  column: {
    id: string;
    title: string;
    cards: {
      id: string;
      title: string;
      content: string;
    }[];
  };
}

const ColumnContainer = styled.div`
  background-color: #ebecf0;
  width: 300px;
  margin: 0 8px;
  border-radius: 3px;
  padding: 8px;
  flex-shrink: 0;
`;

const ColumnTitle = styled.h3`
  padding: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: bold;
`;

const CardList = styled.div<{ isDraggingOver: boolean }>`
  padding: 8px;
  transition: background-color 0.2s ease;
  min-height: 100px;
  background-color: ${props => props.isDraggingOver ? '#e0e3e8' : 'inherit'};
`;

const AddCardButton = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  background-color: transparent;
  border: none;
  color: #5e6c84;
  cursor: pointer;
  text-align: left;
  font-size: 14px;

  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

const Column: React.FC<ColumnProps> = ({ column }) => {
  return (
    <ColumnContainer>
      <ColumnTitle>{column.title}</ColumnTitle>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <CardList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {column.cards.map((card, index) => (
              <Card 
                key={card.id} 
                card={card} 
                index={index}
              />
            ))}
            {provided.placeholder}
          </CardList>
        )}
      </Droppable>
      <AddCardButton>+ 카드 추가</AddCardButton>
    </ColumnContainer>
  );
};

export default Column;
