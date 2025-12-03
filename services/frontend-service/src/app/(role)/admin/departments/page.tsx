'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';
import { Plus, Building, Briefcase } from 'lucide-react';

interface Department {
  id: string;
  code: string;
  name: string;
  sector: string;
  description?: string;
}

const DepartmentsListPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('departments') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDepartments(parsed);
        } else {
          setDepartments(getDefaultDepartments());
        }
      } catch {
        setDepartments(getDefaultDepartments());
      }
    } else {
      setDepartments(getDefaultDepartments());
    }
  }, []);

  const getDefaultDepartments = (): Department[] => [
    { id: '1', code: 'DEV', name: 'Development', sector: 'Information Technology', description: 'Software development and engineering' },
    { id: '2', code: 'FIN', name: 'Finance & Accounts', sector: 'Finance & Accounting', description: 'Financial management and accounting' },
    { id: '3', code: 'PROC', name: 'Procurement', sector: 'Procurement', description: 'Purchasing and vendor management' },
    { id: '4', code: 'MAINT', name: 'Basic Maintenance', sector: 'Other', description: 'General facility maintenance' },
    { id: '5', code: 'IT', name: 'IT', sector: 'Information Technology', description: 'IT infrastructure and support' },
    { id: '6', code: 'ARCH', name: 'Architecture', sector: 'Other', description: 'Architectural design and planning' },
    { id: '7', code: 'ADMIN', name: 'Administration', sector: 'Administration', description: 'General administration' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
              Departments
            </CardTitle>
            <p className="text-sm" style={{ color: THEME.colors.gray }}>Manage departments and organizational structure</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/designations/new">
              <Button variant="outline" className="flex items-center gap-2">
                <Briefcase size={16} />
                Add Designation
              </Button>
            </Link>
            <Link href="/admin/departments/new">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus size={16} />
                Add Department
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8">
          {departments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No departments found. Add your first department to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 font-semibold text-gray-600">Code</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-600">Sector</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-blue-600">{dept.code}</td>
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                          {dept.sector}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{dept.description || '-'}</td>
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

export default DepartmentsListPage;
