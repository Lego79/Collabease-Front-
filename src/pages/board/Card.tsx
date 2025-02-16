// src/components/Card.tsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import styled from 'styled-components';

interface CardProps {
  card: {
    id: string;
    title: string;
    content: string;
  };
  index: number;
}

const CardContainer = styled.div<{ isDragging: boolean }>`
  background-color: ${props => props.isDragging ? '#f0f0f0' : 'white'};
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #f4f5f7;
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
`;

const CardContent = styled.p`
  margin: 0;
  font-size: 12px;
  color: #5e6c84;
`;

export default function Card({ card, index }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <CardContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
        >
          <CardTitle>{card.title}</CardTitle>
          <CardContent>{card.content}</CardContent>
        </CardContainer>
      )}
    </Draggable>
  );
}
