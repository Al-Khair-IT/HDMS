'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';

interface DesignationItem { id: string; positionCode: string; positionName: string; departmentCode?: string }

const DesignationsListPage: React.FC = () => {
  const [items, setItems] = useState<DesignationItem[]>([]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('designations') : null;
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>Designations</CardTitle>
            <p className="text-sm" style={{ color: THEME.colors.gray }}>Manage designations/positions</p>
          </div>
          <div>
            <Link href={`/${'admin'}/designations/new`}>
              <Button variant="primary">Add Designation</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Position Code</th>
                  <th className="text-left py-2 px-4">Position Name</th>
                  <th className="text-left py-2 px-4">Department</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-center text-sm text-gray-600">No designations yet.</td>
                  </tr>
                ) : (
                  items.map(it => (
                    <tr key={it.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{it.positionCode}</td>
                      <td className="py-3 px-4">{it.positionName}</td>
                      <td className="py-3 px-4">{it.departmentCode || 'â€”'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignationsListPage;

