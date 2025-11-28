import React from 'react';
import { TicketTimeline } from './TicketTimeline';
import { Ticket } from '../../types';

interface TimelineSectionProps {
  ticket: Ticket;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ ticket }) => {
  return <TicketTimeline ticket={ticket} />;
};

