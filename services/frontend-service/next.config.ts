import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost/ws',
  },
  async rewrites() {
    return [
      // Communication Service — uses Docker container name on erp_network
      {
        source: '/api/v1/notifications/:path*',
        destination: 'http://hdms-communication-service:8003/api/v1/notifications/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: 'http://hdms-communication-service:8003/api/v1/notifications/:path*',
      },
      // Ticket Service — uses Docker container name on erp_network
      {
        source: '/api/v1/tickets/:path*',
        destination: 'http://hdms-ticket-service:8002/api/v1/tickets/:path*',
      },
      // Auth Service (Core) — uses Docker container name on erp_network
      {
        source: '/api/auth/:path*',
        destination: 'http://auth_service:8000/api/auth/:path*',
      },
      {
        source: '/api/permissions/:path*',
        destination: 'http://auth_service:8000/api/permissions/:path*',
      },
      {
        source: '/api/employees/:path*',
        destination: 'http://auth_service:8000/api/employees/:path*',
      },
      // File Service — uses Docker container name on erp_network
      {
        source: '/api/files/:path*',
        destination: 'http://hdms-file-service:8005/api/files/:path*',
      },
      // Fallback to Auth Service (Core)
      {
        source: '/api/:path*',
        destination: 'http://auth_service:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;


