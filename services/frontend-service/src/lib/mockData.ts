/**
 * Mock Data for Development
 * Hard-coded data for Requester Dashboard
 */

import { Ticket } from '../types';

// Hard-coded tickets for Requester
export const getMockTickets = (requesterId: string): Ticket[] => {
  return [
    {
      id: '1',
      ticketId: 'HD-001',
      subject: 'Laptop not turning on',
      description: 'My laptop stopped working suddenly. It was working fine yesterday.',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '3',
      assigneeName: 'IT Support',
      submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      ticketId: 'HD-002',
      subject: 'Printer paper jam',
      description: 'Printer in office is jammed, need urgent fix',
      department: 'IT',
      priority: 'medium',
      status: 'pending',
      requesterId: requesterId,
      requesterName: 'John Requester',
      submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      ticketId: 'HD-003',
      subject: 'Network connectivity issues',
      description: 'WiFi keeps disconnecting in my area',
      department: 'IT',
      priority: 'high',
      status: 'resolved',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '3',
      assigneeName: 'IT Support',
      submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      ticketId: 'HD-004',
      subject: 'Need new keyboard',
      description: 'Current keyboard keys are not working properly',
      department: 'Procurement',
      priority: 'low',
      status: 'completed',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '5',
      assigneeName: 'Procurement Team',
      submittedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      ticketId: 'HD-005',
      subject: 'Light bulb replacement needed',
      description: 'Light in room 205 is not working',
      department: 'Maintenance',
      priority: 'medium',
      status: 'resolved',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '6',
      assigneeName: 'Maintenance Team',
      submittedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      ticketId: 'HD-006',
      subject: 'Office chair repair',
      description: 'Chair wheel is broken',
      department: 'Maintenance',
      priority: 'low',
      status: 'in_progress',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '6',
      assigneeName: 'Maintenance Team',
      submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      ticketId: 'HD-007',
      subject: 'Request for leave approval',
      description: 'Need approval for 3 days leave',
      department: 'HR',
      priority: 'medium',
      status: 'pending',
      requesterId: requesterId,
      requesterName: 'John Requester',
      submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      ticketId: 'HD-008',
      subject: 'Software license renewal',
      description: 'Need to renew Microsoft Office license',
      department: 'IT',
      priority: 'high',
      status: 'resolved',
      requesterId: requesterId,
      requesterName: 'John Requester',
      assigneeId: '3',
      assigneeName: 'IT Support',
      submittedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Get a single mock ticket by ID
export const getMockTicketById = (ticketId: string, requesterId?: string): Ticket | null => {
  const tickets = getMockTickets(requesterId || '1');
  return tickets.find(t => t.id === ticketId || t.ticketId === ticketId) || null;
};

// Calculate statistics from tickets
export const calculateTicketStats = (tickets: Ticket[]) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Filter resolved tickets this month
  const resolvedThisMonth = tickets.filter(t => {
    if (!t.resolvedDate) return false;
    const resolvedDate = new Date(t.resolvedDate);
    return resolvedDate >= thisMonthStart && resolvedDate <= now;
  });

  // Filter resolved tickets last month
  const resolvedLastMonth = tickets.filter(t => {
    if (!t.resolvedDate) return false;
    const resolvedDate = new Date(t.resolvedDate);
    return resolvedDate >= lastMonthStart && resolvedDate <= lastMonthEnd;
  });

  // Calculate average resolution time
  const resolvedTickets = tickets.filter(t => t.resolvedDate && t.submittedDate);
  const totalResolutionDays = resolvedTickets.reduce((sum, ticket) => {
    const submitted = new Date(ticket.submittedDate);
    const resolved = new Date(ticket.resolvedDate!);
    const days = (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  const avgResolutionTime = resolvedTickets.length > 0 
    ? totalResolutionDays / resolvedTickets.length 
    : 0;

  // Calculate previous month average
  const lastMonthResolved = resolvedTickets.filter(t => {
    const resolvedDate = new Date(t.resolvedDate!);
    return resolvedDate >= lastMonthStart && resolvedDate <= lastMonthEnd;
  });
  const lastMonthAvg = lastMonthResolved.length > 0
    ? lastMonthResolved.reduce((sum, ticket) => {
        const submitted = new Date(ticket.submittedDate);
        const resolved = new Date(ticket.resolvedDate!);
        const days = (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / lastMonthResolved.length
    : avgResolutionTime;

  const resolutionTimeTrend = lastMonthAvg > 0
    ? ((avgResolutionTime - lastMonthAvg) / lastMonthAvg) * 100
    : 0;

  // Open tickets (pending + in_progress)
  const openTickets = tickets.filter(t => 
    t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress'
  );

  // Total requests
  const totalRequests = tickets.length;

  // Resolved count trend
  const resolvedTrend = resolvedLastMonth.length > 0
    ? ((resolvedThisMonth.length - resolvedLastMonth.length) / resolvedLastMonth.length) * 100
    : resolvedThisMonth.length > 0 ? 100 : 0;

  return {
    totalRequests,
    openTickets: openTickets.length,
    resolvedThisMonth: resolvedThisMonth.length,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    resolutionTimeTrend: Math.round(resolutionTimeTrend * 10) / 10,
    resolvedTrend: Math.round(resolvedTrend * 10) / 10,
  };
};

// Get priority distribution
export const getPriorityDistribution = (tickets: Ticket[]) => {
  const distribution = {
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
  };

  return [
    { name: 'High', value: distribution.high, color: '#f87171' },
    { name: 'Medium', value: distribution.medium, color: '#fbbf24' },
    { name: 'Low', value: distribution.low, color: '#34d399' },
  ].filter(item => item.value > 0);
};

// Get status distribution
export const getStatusDistribution = (tickets: Ticket[]) => {
  const statusCounts: Record<string, number> = {};
  
  tickets.forEach(ticket => {
    const status = ticket.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const STATUS_COLORS: Record<string, string> = {
    'draft': '#9ca3af',
    'pending': '#fbbf24',
    'assigned': '#60a5fa',
    'in_progress': '#3b82f6',
    'completed': '#22c55e',
    'resolved': '#34d399',
    'closed': '#6b7280',
    'rejected': '#ef4444',
  };

  const STATUS_LABELS: Record<string, string> = {
    'draft': 'Draft',
    'pending': 'Pending',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'rejected': 'Rejected',
  };

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    count,
    color: STATUS_COLORS[status] || '#6b7280',
  }));
};
