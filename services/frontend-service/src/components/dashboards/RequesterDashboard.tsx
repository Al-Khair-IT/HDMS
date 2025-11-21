'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { KpiCard } from '../common/KpiCard';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityDistributionChart } from '../charts/PriorityDistributionChart';
import { StatusDistributionChart } from '../charts/StatusDistributionChart';
import { ResolutionTimeTrendChart } from '../charts/ResolutionTimeTrendChart';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus,
  ArrowRight 
} from 'lucide-react';
import { Ticket } from '../../types';
import { 
  getMockTickets, 
  calculateTicketStats, 
  getPriorityDistribution, 
  getStatusDistribution 
} from '../../lib/mockData';

const RequesterDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'resolved' | 'drafts'>('all');

  // Fetch tickets (hard-coded for now)
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use hard-coded data
        const mockTickets = getMockTickets(user?.id || '1');
        setTickets(mockTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
          setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Calculate statistics
  const stats = useMemo(() => calculateTicketStats(tickets), [tickets]);

  // Get recent tickets (5-10 most recent)
  const recentTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const dateA = new Date(a.submittedDate).getTime();
      const dateB = new Date(b.submittedDate).getTime();
      return dateB - dateA;
    });

    // Apply filter
    if (activeFilter === 'open') {
      return sorted.filter(t => 
        t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress'
      ).slice(0, 10);
    } else if (activeFilter === 'resolved') {
      return sorted.filter(t => 
        t.status === 'resolved' || t.status === 'completed'
      ).slice(0, 10);
    } else if (activeFilter === 'drafts') {
      // Drafts are not tickets, so return empty array
      return [];
    }
    
    return sorted.slice(0, 10);
  }, [tickets, activeFilter]);

  // Get priority and status distributions
  const priorityDistribution = useMemo(() => getPriorityDistribution(tickets), [tickets]);
  const statusDistribution = useMemo(() => getStatusDistribution(tickets), [tickets]);

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
      {/* Header Card with Gradient Background */}
      <Card 
        className="rounded-xl shadow-2xl border-0"
        style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
          backgroundColor: '#ffffff'
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: '#274c77' }}
              >
                Welcome, {user?.name || 'User'}! 👋
        </h1>
              <p style={{ color: '#8b8c89' }} className="text-base sm:text-lg">
                Here's an overview of your help desk requests
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span style={{ color: '#8b8c89' }}>Total Requests: </span>
                  <span className="font-semibold" style={{ color: '#274c77' }}>{stats.totalRequests}</span>
      </div>
                <div>
                  <span style={{ color: '#8b8c89' }}>Open Tickets: </span>
                  <span className={`font-semibold ${stats.openTickets > 5 ? 'text-yellow-600' : ''}`} style={{ color: stats.openTickets > 5 ? '#fbbf24' : '#274c77' }}>
                    {stats.openTickets}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => router.push('/requester/new-request')}
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" style={{ color: 'white' }} />}
                className="w-full sm:w-auto"
              >
                New Request
              </Button>
                  </div>
              </div>
            </CardContent>
          </Card>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          color="#ffffff"
          backgroundColor="#365486"
          description="All tickets you've created"
          onClick={() => router.push('/requester/requests')}
        />
        
        <KpiCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={AlertCircle}
          color="#ffffff"
          backgroundColor="#adb5bd"
          description="Tickets in progress/pending"
          trend={stats.openTickets > 0 ? {
            value: stats.openTickets > 5 ? 10 : -5,
            label: 'vs last week'
          } : undefined}
          onClick={() => {
            setActiveFilter('open');
            router.push('/requester/requests?filter=open');
          }}
        />
        
        <KpiCard
          title="Resolved This Month"
          value={stats.resolvedThisMonth}
          icon={CheckCircle}
          color="#ffffff"
          backgroundColor="#6096ba"
          description="Tickets closed this month"
          trend={{
            value: stats.resolvedTrend,
            label: 'vs last month'
          }}
          onClick={() => {
            setActiveFilter('resolved');
            router.push('/requester/requests?filter=resolved');
          }}
        />
        
        <KpiCard
          title="Average Resolution Time"
          value={`${stats.avgResolutionTime} days`}
          icon={Clock}
          color="#374151"
          backgroundColor="#e5e7eb"
          description="Average time to resolve"
          trend={{
            value: -stats.resolutionTimeTrend,
            label: 'vs last month'
          }}
        />
         </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Chart */}
        <PriorityDistributionChart data={priorityDistribution} />

        {/* Status Distribution Chart */}
        <StatusDistributionChart data={statusDistribution} />
      </div>

      {/* Resolution Time Trend Chart */}
      <ResolutionTimeTrendChart data={[]} />

      {/* Recent Requests Table */}
      <Card className="rounded-xl bg-white shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold" style={{ color: '#274c77' }}>
              My Recent Requests
            </h2>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'open', 'resolved', 'drafts'] as const).map((filter) => {
                const isActive = activeFilter === filter;
                if (isActive) {
                  return (
                    <Button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      variant="primary"
                      size="sm"
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  );
                }
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gray-100 hover:bg-gray-200 border-none"
                    style={{
                      color: '#374151',
                      fontWeight: 500,
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/requester/requests')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="text-sm"
              >
                View All
              </Button>
                </div>
              </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
              <p className="text-gray-600">No requests found</p>
              <Button
                onClick={() => router.push('/requester/new-request')}
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" style={{ color: 'white' }} />}
                className="mt-4"
              >
                Create Your First Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr 
                    className="border-b"
                    style={{ backgroundColor: '#274c77' }}
                  >
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/requester/request-detail/${ticket.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium" style={{ color: '#274c77' }}>
                          {ticket.ticketId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-sm truncate" style={{ color: '#111827' }}>
                            {ticket.subject}
                          </p>
                          {ticket.description && (
                            <p className="text-xs truncate mt-1" style={{ color: '#8b8c89' }}>
                              {ticket.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: '#6b7280' }}>
                        {ticket.department}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: '#6b7280' }}>
                        {formatDate(ticket.submittedDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/requester/request-detail/${ticket.id}`);
                          }}
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                          className="text-xs"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
          )}
            </CardContent>
          </Card>
    </div>
  );
};

export default RequesterDashboard;