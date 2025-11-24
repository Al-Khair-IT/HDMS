'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KpiCard } from '../common/KpiCard';
import { DepartmentLoadChart } from '../charts/DepartmentLoadChart';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';
import { THEME } from '../../lib/theme';
import { formatRelativeTime, formatDate } from '../../lib/helpers';
import { 
  FileText,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Users,
  Activity,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Timer
} from 'lucide-react';

interface DashboardStats {
  pendingReview: number;
  totalActiveTickets: number;
  ticketsAssignedToday: number;
  averageResolutionTime: number; // in hours
  slaBreaches: number;
}

interface DepartmentWorkload {
  department: string;
  activeTickets: number;
  loadLevel: 'low' | 'medium' | 'high';
}

interface TicketRequiringAttention {
  ticket: Ticket;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface SLATicket {
  ticket: Ticket;
  timeRemaining?: number; // in hours
  timeOverdue?: number; // in hours
  isBreached: boolean;
  isApproaching: boolean;
}

// Mock Data Generator for Moderator Dashboard
const generateMockTickets = (): Ticket[] => {
  const now = new Date();
  const departments = ['IT', 'HR', 'Procurement', 'Electrical', 'Plumbers', 'Furniture Maintenance', 'Accounts', 'IT Maintenance'];
  
  const mockTickets: Ticket[] = [
    // Pending Review > 24 hours
    {
      id: '1',
      ticketId: 'HD-2024-001',
      subject: 'Server downtime in Building A',
      description: 'Server has been down for 2 days, affecting multiple departments',
      department: 'IT',
      priority: 'urgent',
      status: 'pending',
      requesterId: 'req-1',
      requesterName: 'Ahmed Khan',
      submittedDate: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    },
    {
      id: '2',
      ticketId: 'HD-2024-002',
      subject: 'AC not working in Conference Room',
      description: 'Air conditioning unit stopped working, room temperature is very high',
      department: 'Electrical',
      priority: 'high',
      status: 'submitted',
      requesterId: 'req-2',
      requesterName: 'Fatima Ali',
      submittedDate: new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
    },
    {
      id: '3',
      ticketId: 'HD-2024-003',
      subject: 'Leakage in washroom',
      description: 'Water leakage from ceiling in 2nd floor washroom',
      department: 'Plumbers',
      priority: 'high',
      status: 'pending',
      requesterId: 'req-3',
      requesterName: 'Hassan Raza',
      submittedDate: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(), // 50 hours ago
    },
    
    // SLA Breached Tickets
    {
      id: '4',
      ticketId: 'HD-2024-004',
      subject: 'Network connectivity issues',
      description: 'WiFi keeps disconnecting in entire floor',
      department: 'IT Maintenance',
      priority: 'urgent',
      status: 'assigned',
      requesterId: 'req-4',
      requesterName: 'Sara Ahmed',
      assigneeId: 'assignee-1',
      assigneeName: 'IT Support Team',
      moderatorId: 'mod-1',
      moderatorName: 'Moderator User',
      submittedDate: new Date(now.getTime() - 80 * 60 * 60 * 1000).toISOString(), // 80 hours ago (breached)
      assignedDate: new Date(now.getTime() - 75 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      ticketId: 'HD-2024-005',
      subject: 'Printer not working',
      description: 'Main office printer is showing error and not printing',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req-5',
      requesterName: 'Ali Hassan',
      assigneeId: 'assignee-2',
      assigneeName: 'IT Technician',
      submittedDate: new Date(now.getTime() - 90 * 60 * 60 * 1000).toISOString(), // 90 hours ago (breached)
      assignedDate: new Date(now.getTime() - 85 * 60 * 60 * 1000).toISOString(),
    },
    
    // SLA Approaching Tickets
    {
      id: '6',
      ticketId: 'HD-2024-006',
      subject: 'New employee onboarding',
      description: 'Need to set up workstation for new employee',
      department: 'HR',
      priority: 'medium',
      status: 'assigned',
      requesterId: 'req-6',
      requesterName: 'Zainab Malik',
      assigneeId: 'assignee-3',
      assigneeName: 'HR Team',
      submittedDate: new Date(now.getTime() - 65 * 60 * 60 * 1000).toISOString(), // 65 hours ago (approaching)
      assignedDate: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      ticketId: 'HD-2024-007',
      subject: 'Purchase request for office supplies',
      description: 'Need to order stationery items for Q1',
      department: 'Procurement',
      priority: 'medium',
      status: 'in_progress',
      requesterId: 'req-7',
      requesterName: 'Bilal Khan',
      assigneeId: 'assignee-4',
      assigneeName: 'Procurement Officer',
      submittedDate: new Date(now.getTime() - 68 * 60 * 60 * 1000).toISOString(), // 68 hours ago (approaching)
      assignedDate: new Date(now.getTime() - 65 * 60 * 60 * 1000).toISOString(),
    },
    
    // Tickets Assigned Today
    {
      id: '8',
      ticketId: 'HD-2024-008',
      subject: 'Light bulb replacement',
      description: 'Multiple bulbs need replacement in corridor',
      department: 'Electrical',
      priority: 'medium',
      status: 'assigned',
      requesterId: 'req-8',
      requesterName: 'Nadia Sheikh',
      assigneeId: 'assignee-5',
      assigneeName: 'Electrician',
      moderatorId: 'mod-1',
      moderatorName: 'Moderator User',
      submittedDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (today)
    },
    {
      id: '9',
      ticketId: 'HD-2024-009',
      subject: 'Chair repair needed',
      description: 'Office chair wheel is broken',
      department: 'Furniture Maintenance',
      priority: 'low',
      status: 'assigned',
      requesterId: 'req-9',
      requesterName: 'Omar Ali',
      assigneeId: 'assignee-6',
      assigneeName: 'Maintenance Team',
      submittedDate: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (today)
    },
    {
      id: '10',
      ticketId: 'HD-2024-010',
      subject: 'Salary query',
      description: 'Need clarification on salary deduction',
      department: 'Accounts',
      priority: 'high',
      status: 'assigned',
      requesterId: 'req-10',
      requesterName: 'Ayesha Raza',
      assigneeId: 'assignee-7',
      assigneeName: 'Accounts Team',
      submittedDate: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago (today)
    },
    
    // Active Tickets (various departments)
    {
      id: '11',
      ticketId: 'HD-2024-011',
      subject: 'Software license renewal',
      description: 'Microsoft Office license expiring soon',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req-11',
      requesterName: 'Kamran Malik',
      assigneeId: 'assignee-1',
      assigneeName: 'IT Support Team',
      submittedDate: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '12',
      ticketId: 'HD-2024-012',
      subject: 'Water cooler not working',
      description: 'Water dispenser stopped working',
      department: 'Plumbers',
      priority: 'medium',
      status: 'assigned',
      requesterId: 'req-12',
      requesterName: 'Saima Khan',
      assigneeId: 'assignee-8',
      assigneeName: 'Plumber',
      submittedDate: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '13',
      ticketId: 'HD-2024-013',
      subject: 'Desk drawer stuck',
      description: 'Desk drawer in room 301 is stuck',
      department: 'Furniture Maintenance',
      priority: 'low',
      status: 'in_progress',
      requesterId: 'req-13',
      requesterName: 'Tariq Hussain',
      assigneeId: 'assignee-6',
      assigneeName: 'Maintenance Team',
      submittedDate: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '14',
      ticketId: 'HD-2024-014',
      subject: 'Leave approval request',
      description: 'Need approval for 5 days leave',
      department: 'HR',
      priority: 'medium',
      status: 'pending',
      requesterId: 'req-14',
      requesterName: 'Farhan Ali',
      submittedDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '15',
      ticketId: 'HD-2024-015',
      subject: 'Invoice processing',
      description: 'Urgent invoice needs processing',
      department: 'Accounts',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req-15',
      requesterName: 'Hina Sheikh',
      assigneeId: 'assignee-7',
      assigneeName: 'Accounts Team',
      submittedDate: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(),
    },
    
    // Resolved Tickets (for average calculation)
    {
      id: '16',
      ticketId: 'HD-2024-016',
      subject: 'Email configuration',
      description: 'Need help setting up email client',
      department: 'IT',
      priority: 'medium',
      status: 'resolved',
      requesterId: 'req-16',
      requesterName: 'Usman Khan',
      assigneeId: 'assignee-1',
      assigneeName: 'IT Support Team',
      submittedDate: new Date(now.getTime() - 100 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 98 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 95 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 92 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '17',
      ticketId: 'HD-2024-017',
      subject: 'Phone extension setup',
      description: 'Need new phone extension',
      department: 'IT',
      priority: 'low',
      status: 'resolved',
      requesterId: 'req-17',
      requesterName: 'Amina Raza',
      assigneeId: 'assignee-1',
      assigneeName: 'IT Support Team',
      submittedDate: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 118 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 110 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '18',
      ticketId: 'HD-2024-018',
      subject: 'Door lock repair',
      description: 'Main entrance door lock is not working',
      department: 'Furniture Maintenance',
      priority: 'high',
      status: 'resolved',
      requesterId: 'req-18',
      requesterName: 'Zubair Ahmed',
      assigneeId: 'assignee-6',
      assigneeName: 'Maintenance Team',
      submittedDate: new Date(now.getTime() - 150 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 148 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 140 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 138 * 60 * 60 * 1000).toISOString(),
    },
    
    // More active tickets for department distribution
    {
      id: '19',
      ticketId: 'HD-2024-019',
      subject: 'Cable management',
      description: 'Cables need proper organization',
      department: 'IT Maintenance',
      priority: 'low',
      status: 'assigned',
      requesterId: 'req-19',
      requesterName: 'Rashid Ali',
      assigneeId: 'assignee-1',
      assigneeName: 'IT Support Team',
      submittedDate: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '20',
      ticketId: 'HD-2024-020',
      subject: 'Power socket installation',
      description: 'Need additional power socket in meeting room',
      department: 'Electrical',
      priority: 'medium',
      status: 'in_progress',
      requesterId: 'req-20',
      requesterName: 'Nida Malik',
      assigneeId: 'assignee-5',
      assigneeName: 'Electrician',
      submittedDate: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return mockTickets;
};

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ticketService.getTickets();
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);
        
        if (ticketsList.length > 0) {
        setTickets(ticketsList);
          setUseMockData(false);
        } else {
          // Use mock data if API returns empty
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        }
        
        // Generate recent activity from tickets
        const activity = generateRecentActivity(ticketsList.length > 0 ? ticketsList : generateMockTickets());
        setRecentActivity(activity);
      } catch (error: any) {
        const isNetworkError = error?.isNetworkError || !error?.response;
        if (isNetworkError) {
          console.warn('API not available, using mock data');
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
          
          const activity = generateRecentActivity(mockTickets);
          setRecentActivity(activity);
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
          
          const activity = generateRecentActivity(mockTickets);
          setRecentActivity(activity);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slaHours = 72; // 3 days default SLA

    // Pending Review - tickets pending > 24 hours
    const pendingReview = tickets.filter(t => {
      if (t.status !== 'pending' && t.status !== 'submitted') return false;
      const submitted = new Date(t.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      return hoursSinceSubmission > 24;
    }).length;

    // Total Active Tickets - all non-closed tickets
    const totalActiveTickets = tickets.filter(t => 
      !['resolved', 'closed', 'rejected'].includes(t.status)
    ).length;

    // Tickets Assigned Today
    const ticketsAssignedToday = tickets.filter(t => {
      if (!t.assignedDate) return false;
      const assigned = new Date(t.assignedDate);
      return assigned >= today;
    }).length;

    // Average Resolution Time
    const resolvedTickets = tickets.filter(t => t.resolvedDate);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          const submitted = new Date(t.submittedDate);
          const resolved = new Date(t.resolvedDate!);
          const hours = (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / resolvedTickets.length
      : 0;

    // SLA Breaches
    const slaBreaches = tickets.filter(t => {
      if (['resolved', 'closed', 'rejected'].includes(t.status)) return false;
      const submitted = new Date(t.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      return hoursSinceSubmission > slaHours;
    }).length;

    return {
      pendingReview,
      totalActiveTickets,
      ticketsAssignedToday,
      averageResolutionTime: Math.round(avgResolutionTime),
      slaBreaches
    };
  }, [tickets]);

  // Department Workload
  const departmentWorkload: DepartmentWorkload[] = useMemo(() => {
    const deptMap = new Map<string, number>();
    
    tickets.forEach(t => {
      if (!['resolved', 'closed', 'rejected'].includes(t.status)) {
        const count = deptMap.get(t.department) || 0;
        deptMap.set(t.department, count + 1);
      }
    });

    const workload: DepartmentWorkload[] = Array.from(deptMap.entries()).map(([dept, count]) => {
      let loadLevel: 'low' | 'medium' | 'high' = 'low';
      if (count > 15) loadLevel = 'high';
      else if (count > 8) loadLevel = 'medium';
      
      return { department: dept, activeTickets: count, loadLevel };
    });

    return workload.sort((a, b) => b.activeTickets - a.activeTickets);
  }, [tickets]);

  // Chart data for Department Workload
  const chartData = useMemo(() => {
    return departmentWorkload.map(dept => ({
      department: dept.department,
      assigned: dept.activeTickets,
      completed: 0,
      pending: 0
    }));
  }, [departmentWorkload]);

  // Tickets Requiring Attention
  const ticketsRequiringAttention: TicketRequiringAttention[] = useMemo(() => {
    const now = new Date();
    const attentionTickets: TicketRequiringAttention[] = [];

    tickets.forEach(ticket => {
      const submitted = new Date(ticket.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      const slaHours = 72;

      // Pending review > 24 hours
      if ((ticket.status === 'pending' || ticket.status === 'submitted') && hoursSinceSubmission > 24) {
        attentionTickets.push({
          ticket,
          reason: `Pending review for ${Math.floor(hoursSinceSubmission / 24)} days`,
          priority: hoursSinceSubmission > 48 ? 'high' : 'medium'
        });
      }

      // SLA breaches
      if (!['resolved', 'closed', 'rejected'].includes(ticket.status) && hoursSinceSubmission > slaHours) {
        const existing = attentionTickets.find(item => item.ticket.id === ticket.id);
        if (!existing) {
          attentionTickets.push({
            ticket,
            reason: `SLA breached by ${Math.floor((hoursSinceSubmission - slaHours) / 24)} days`,
            priority: 'high'
          });
        }
      }
    });

    return attentionTickets
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Top 10
  }, [tickets]);

  // SLA Alerts
  const slaAlerts: SLATicket[] = useMemo(() => {
    const now = new Date();
    const slaHours = 72;
    const alerts: SLATicket[] = [];

    tickets.forEach(ticket => {
      if (['resolved', 'closed', 'rejected'].includes(ticket.status)) return;

      const submitted = new Date(ticket.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      const remaining = slaHours - hoursSinceSubmission;
      const percentage = (remaining / slaHours) * 100;

      const isBreached = hoursSinceSubmission > slaHours;
      const isApproaching = !isBreached && percentage < 25;

      if (isBreached || isApproaching) {
        alerts.push({
          ticket,
          timeOverdue: isBreached ? hoursSinceSubmission - slaHours : undefined,
          timeRemaining: !isBreached ? remaining : undefined,
          isBreached,
          isApproaching
        });
      }
    });

    return alerts
      .sort((a, b) => {
        if (a.isBreached && !b.isBreached) return -1;
        if (!a.isBreached && b.isBreached) return 1;
        return (a.timeOverdue || 0) - (b.timeOverdue || 0);
      })
      .slice(0, 10); // Top 10
  }, [tickets]);

  // Generate Recent Activity
  const generateRecentActivity = (ticketsList: Ticket[]): any[] => {
    const activities: any[] = [];

    ticketsList.forEach(ticket => {
      // Ticket assigned
      if (ticket.assignedDate) {
        activities.push({
          id: `${ticket.id}-assigned`,
          type: 'assigned',
          title: 'Ticket Assigned',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.assignedDate,
          user: ticket.moderatorName || 'System',
          ticketId: ticket.id
        });
      }

      // Ticket completed
      if (ticket.completedDate) {
        activities.push({
          id: `${ticket.id}-completed`,
          type: 'completed',
          title: 'Work Completed',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.completedDate,
          user: ticket.assigneeName || 'Assignee',
          ticketId: ticket.id
        });
      }

      // Ticket resolved
      if (ticket.resolvedDate) {
        activities.push({
          id: `${ticket.id}-resolved`,
          type: 'resolved',
          title: 'Ticket Resolved',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.resolvedDate,
          user: ticket.requesterName,
          ticketId: ticket.id
        });
      }

      // Recent ticket created
      const submitted = new Date(ticket.submittedDate);
      const hoursAgo = (Date.now() - submitted.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        activities.push({
          id: `${ticket.id}-created`,
          type: 'created',
          title: 'Ticket Created',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.submittedDate,
          user: ticket.requesterName,
          ticketId: ticket.id
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return FileText;
      case 'assigned': return Users;
      case 'completed': return CheckCircle;
      case 'resolved': return CheckCircle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return THEME.colors.info;
      case 'assigned': return THEME.colors.primary;
      case 'completed': return THEME.colors.success;
      case 'resolved': return THEME.colors.success;
      default: return THEME.colors.gray;
    }
  };

  const handleDepartmentClick = (department: string) => {
    router.push(`/moderator/ticket-pool?department=${encodeURIComponent(department)}`);
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/moderator/review?id=${ticketId}`);
  };

  if (loading) {
  return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
                  
                  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: THEME.colors.background }}>
      {/* Mock Data Indicator */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Showing mock data for demonstration purposes
          </p>
                          </div>
      )}

      {/* Header Card - Helpdesk Overview */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
                Helpdesk Overview
              </CardTitle>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                System-wide statistics and performance metrics
              </p>
                        </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-5 h-5" />
              <span>Last updated: {formatDate(new Date().toISOString(), 'time')}</span>
                          </div>
                        </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                {tickets.length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Tickets</p>
                      </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: THEME.colors.success }}>
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Resolved</p>
                    </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: THEME.colors.warning }}>
                {tickets.filter(t => ['pending', 'submitted'].includes(t.status)).length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: THEME.colors.error }}>
                {stats.slaBreaches}
              </p>
              <p className="text-xs text-gray-600 mt-1">SLA Breaches</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        <KpiCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
          color={THEME.colors.warning}
          description="Tickets awaiting review > 24h"
          onClick={() => router.push('/moderator/review')}
        />
        <KpiCard
          title="Total Active Tickets"
          value={stats.totalActiveTickets}
          icon={FileText}
          color={THEME.colors.primary}
          description="All non-closed tickets"
        />
        <KpiCard
          title="Assigned Today"
          value={stats.ticketsAssignedToday}
          icon={Users}
          color={THEME.colors.info}
          description="Tickets assigned today"
        />
        <KpiCard
          title="Avg Resolution Time"
          value={`${stats.averageResolutionTime}h`}
          icon={Timer}
          color={THEME.colors.success}
          description="Average time to resolve"
        />
        <KpiCard
          title="SLA Breaches"
          value={stats.slaBreaches}
          icon={AlertCircle}
          color={stats.slaBreaches > 0 ? THEME.colors.error : THEME.colors.success}
          backgroundColor={stats.slaBreaches > 0 ? '#FEE2E2' : '#D1FAE5'}
          description={stats.slaBreaches > 0 ? 'Tickets with breached SLA' : 'All tickets within SLA'}
        />
                  </div>

      {/* Department Workload Distribution */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
            Department Workload Distribution
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Active tickets per department</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DepartmentLoadChart data={chartData} height={300} />
                </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
            {departmentWorkload.map((dept) => {
              const loadColor = 
                dept.loadLevel === 'high' ? THEME.colors.error :
                dept.loadLevel === 'medium' ? THEME.colors.warning :
                THEME.colors.success;
              
              return (
                <div
                  key={dept.department}
                  onClick={() => handleDepartmentClick(dept.department)}
                  className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all"
                  style={{
                    borderColor: loadColor + '40',
                    backgroundColor: loadColor + '10'
                  }}
                >
                  <p className="text-xs font-semibold text-gray-700 mb-1 truncate">
                    {dept.department}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: loadColor }}>
                    {dept.activeTickets}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{dept.loadLevel} load</p>
              </div>
              );
            })}
            </div>
          </CardContent>
        </Card>

      {/* Tickets Requiring Attention & SLA Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tickets Requiring Attention */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                Tickets Requiring Attention
              </CardTitle>
              {ticketsRequiringAttention.length > 0 && (
                <span className="px-2 py-1 text-xs font-bold text-white rounded-full bg-red-500">
                  {ticketsRequiringAttention.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ticketsRequiringAttention.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No tickets require immediate attention</p>
                    </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ticketsRequiringAttention.map((item) => {
                  const priorityColor = 
                    item.priority === 'high' ? THEME.colors.error :
                    item.priority === 'medium' ? THEME.colors.warning :
                    THEME.colors.info;
                  
                  return (
                    <div
                      key={item.ticket.id}
                      onClick={() => handleTicketClick(item.ticket.id)}
                      className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all"
                      style={{ borderColor: priorityColor + '40' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold" style={{ color: priorityColor }}>
                              {item.ticket.ticketId}
                            </span>
                            <span
                              className="px-2 py-0.5 text-xs font-semibold rounded"
                              style={{
                                backgroundColor: priorityColor + '20',
                                color: priorityColor
                              }}
                            >
                              {item.priority.toUpperCase()}
                            </span>
                  </div>
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {item.ticket.subject}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{item.reason}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{item.ticket.department}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.ticket.submittedDate)}</span>
                </div>
              </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
                  );
                })}
              </div>
            )}
            </CardContent>
          </Card>

        {/* SLA Alerts */}
        <Card className="shadow-lg">
          <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                SLA Alerts
              </CardTitle>
              {slaAlerts.length > 0 && (
                <span className="px-2 py-1 text-xs font-bold text-white rounded-full bg-red-500">
                  {slaAlerts.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {slaAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>All tickets are within SLA</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {slaAlerts.map((alert) => {
                  const alertColor = alert.isBreached ? THEME.colors.error : THEME.colors.warning;
                  
                  return (
                    <div
                      key={alert.ticket.id}
                      onClick={() => handleTicketClick(alert.ticket.id)}
                      className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all"
                      style={{ borderColor: alertColor + '40' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold" style={{ color: alertColor }}>
                              {alert.ticket.ticketId}
                            </span>
                            <span
                              className="px-2 py-0.5 text-xs font-semibold rounded text-white"
                              style={{ backgroundColor: alertColor }}
                            >
                              {alert.isBreached ? 'BREACHED' : 'APPROACHING'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate mb-2">
                            {alert.ticket.subject}
                          </p>
                          <div className="flex items-center gap-3 text-xs mb-2">
                            <span className="text-gray-600">{alert.ticket.department}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold" style={{ color: alertColor }}>
                              {alert.isBreached
                                ? `${Math.floor(alert.timeOverdue! / 24)}d ${Math.floor(alert.timeOverdue! % 24)}h overdue`
                                : `${Math.floor(alert.timeRemaining! / 24)}d ${Math.floor(alert.timeRemaining! % 24)}h remaining`
                              }
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${Math.max(0, Math.min(100, alert.isBreached ? 0 : (alert.timeRemaining! / 72) * 100))}%`,
                                backgroundColor: alertColor
                              }}
                            />
                          </div>
                </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
                  );
                })}
              </div>
            )}
            </CardContent>
          </Card>
        </div>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
            Recent Activity
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Timeline of recent system actions</p>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline Items */}
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                    
                    return (
                    <div key={activity.id} className="relative flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div
                        className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-4 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>By {activity.user}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(activity.timestamp, 'short')}
                          </div>
                        </div>
                              </div>
                            </div>
                    );
                  })}
              </div>
            </div>
          )}
          </CardContent>
        </Card>
    </div>
  );
};

export default ModeratorDashboard;