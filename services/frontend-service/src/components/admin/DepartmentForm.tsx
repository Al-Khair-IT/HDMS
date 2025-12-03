'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';

type Sector =
  | 'Academic'
  | 'Information Technology'
  | 'Finance & Accounting'
  | 'Medical & Health'
  | 'Human Resources'
  | 'Administration'
  | 'Procurement'
  | 'Other';

interface Department {
  id: string;
  code: string;
  name: string;
  sector: Sector;
  description?: string;
  institutionAddress?: string;
  principalName?: string;
  institutionContact?: string;
}

const DepartmentForm: React.FC<{ initial?: Partial<Department> }> = ({ initial = {} }) => {
  const router = useRouter();
  const [code, setCode] = useState(initial.code || '');
  const [name, setName] = useState(initial.name || '');
  const [sector, setSector] = useState<Sector>((initial.sector as Sector) || 'Other');
  const [description, setDescription] = useState(initial.description || '');
  const [institutionAddress, setInstitutionAddress] = useState(initial.institutionAddress || '');
  const [principalName, setPrincipalName] = useState(initial.principalName || '');
  const [institutionContact, setInstitutionContact] = useState(initial.institutionContact || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [code, name, sector]);

  const validate = (): string | null => {
    if (!code.trim()) return 'Department Code is required';
    if (!/^[A-Za-z0-9-]+$/.test(code)) return 'Code must be alphanumeric with optional hyphens';
    if (code.length > 20) return 'Code must be 20 characters or less';
    if (!name.trim()) return 'Department Name is required';
    if (name.length > 200) return 'Department Name must be 200 characters or less';
    // uniqueness
    const stored = typeof window !== 'undefined' ? localStorage.getItem('departments') : null;
    const deps = stored ? JSON.parse(stored) : [];
    const exists = deps.some((d: Department) => d.code.toLowerCase() === code.toLowerCase() && d.id !== initial.id);
    if (exists) return 'Department Code must be unique';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    const stored = typeof window !== 'undefined' ? localStorage.getItem('departments') : null;
    const deps: Department[] = stored ? JSON.parse(stored) : [];
    const payload: Department = {
      id: initial.id || `DEPT-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      sector,
      description: description.trim() || undefined,
      institutionAddress: institutionAddress.trim() || undefined,
      principalName: principalName.trim() || undefined,
      institutionContact: institutionContact.trim() || undefined,
    };

    // if editing replace
    const index = deps.findIndex(d => d.id === payload.id);
    if (index >= 0) {
      deps[index] = payload;
    } else {
      deps.push(payload);
    }
    localStorage.setItem('departments', JSON.stringify(deps));
    // After saving go back to list
    router.push(`/${'admin'}/departments`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department Code *</label>
              <input
                maxLength={20}
                placeholder="Example: C06-M, AIT01, FIN"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Short unique code for department (alphanumeric and hyphens)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department Name *</label>
              <input
                maxLength={200}
                placeholder="Example: Computer Science Department"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Organizational Sector</label>
            <select value={sector} onChange={(e) => setSector(e.target.value as Sector)} className="w-full px-3 py-2 border rounded">
              <option>Academic</option>
              <option>Information Technology</option>
              <option>Finance & Accounting</option>
              <option>Medical & Health</option>
              <option>Human Resources</option>
              <option>Administration</option>
              <option>Procurement</option>
              <option>Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Which sector does this department belong to?</p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Department Description</label>
            <textarea rows={4} placeholder="Describe department functions, goals, and responsibilities..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          {sector === 'Academic' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Institution Address</label>
                <textarea rows={3} value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Principal/Head Name</label>
                <input value={principalName} onChange={(e) => setPrincipalName(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institution Contact Number</label>
                <input type="tel" value={institutionContact} onChange={(e) => setInstitutionContact(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => router.push(`/${'admin'}/departments`)}>Cancel</Button>
            <Button type="submit">Save Department</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default DepartmentForm;
