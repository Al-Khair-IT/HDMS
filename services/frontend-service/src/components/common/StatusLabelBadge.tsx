import React from 'react';
import { StatusBadge } from './StatusBadge';

interface StatusLabelBadgeProps {
  status: string;
}

export const StatusLabelBadge: React.FC<StatusLabelBadgeProps> = ({ status }) => {
  return <StatusBadge status={status} withIcon={false} withBorder={true} />;
};

