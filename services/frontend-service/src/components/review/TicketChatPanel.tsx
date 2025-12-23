'use client';

import React from 'react';
import { UnifiedChatPanel } from '../chat/UnifiedChatPanel';

interface TicketChatPanelProps {
    ticketId: string;
}

/**
 * TicketChatPanel - Wrapper for the unified chat panel
 * Used in moderator review pages and other ticket detail views
 */
export const TicketChatPanel: React.FC<TicketChatPanelProps> = ({ ticketId }) => {
    return <UnifiedChatPanel ticketId={ticketId} />;
};

export default TicketChatPanel;
