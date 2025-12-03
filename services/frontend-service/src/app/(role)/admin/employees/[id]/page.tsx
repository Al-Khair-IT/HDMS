'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { THEME } from '../../../../../lib/theme';

interface Department {
  dept_code: string;
  dept_name: string;
  dept_sector: string;
}

interface Designation {
  position_code: string;
  position_name: string;
}

interface Education {
  degree: string;
  institute: string;
  passingYear: string;
}

interface Experience {
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface Employee {
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  cnic: string;
  dob: string | null;
  gender: string;
  nationality: string | null;
  religion: string | null;
  emergency_contact_phone: string | null;
  residential_address: string;
  permanent_address: string | null;
  city: string | null;
  state: string | null;
  department: Department | null;
  designation: Designation | null;
  joining_date: string | null;
  employment_type: string;
  employment_type_value: string;
  organization_phone: string | null;
  bank_name: string;
  account_number: string;
  education_history: Education[] | null;
  work_experience: Experience[] | null;
  resume: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const EmployeeDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/employees/${employeeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Employee not found');
          } else {
            setError('Failed to load employee details');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <Card className="bg-white rounded-xl shadow">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Employee not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{employee.full_name}</h2>
            <p className="text-sm text-gray-600">{employee.employee_code}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="mt-1 font-semibold text-blue-600">{employee.employee_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employee Code</label>
              <p className="mt-1 font-semibold">{employee.employee_code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="mt-1">{employee.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="mt-1">{employee.dob || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CNIC</label>
              <p className="mt-1">{employee.cnic || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <p className="mt-1 capitalize">{employee.gender || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nationality</label>
              <p className="mt-1">{employee.nationality || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Religion</label>
              <p className="mt-1">{employee.religion || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1">{employee.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Mobile Number</label>
              <p className="mt-1">{employee.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Emergency Phone</label>
              <p className="mt-1">{employee.emergency_contact_phone || '—'}</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600">Residential Address</label>
            <p className="mt-1">{employee.residential_address}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Permanent Address</label>
              <p className="mt-1">{employee.permanent_address || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              <p className="mt-1">{employee.city || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              <p className="mt-1">{employee.state || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Department</label>
              {employee.department ? (
                <p className="mt-1">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {employee.department.dept_code} - {employee.department.dept_name}
                  </span>
                </p>
              ) : (
                <p className="mt-1">—</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Designation</label>
              {employee.designation ? (
                <p className="mt-1">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {employee.designation.position_code} - {employee.designation.position_name}
                  </span>
                </p>
              ) : (
                <p className="mt-1">—</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Joining</label>
              <p className="mt-1">{employee.joining_date || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employment Type</label>
              <p className="mt-1">
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {employee.employment_type}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Bank Name</label>
              <p className="mt-1">{employee.bank_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Number</label>
              <p className="mt-1">{employee.account_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Provided */}
      {(employee.email || employee.organization_phone) && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Provided By Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Organization Email</label>
                <p className="mt-1">{employee.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Organization Phone</label>
                <p className="mt-1">{employee.organization_phone || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {employee.education_history && employee.education_history.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Educational History</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.education_history.map((edu, idx) => (
              <div key={idx} className="border p-4 rounded-lg mb-3 last:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Degree/Certificate</label>
                    <p className="mt-1">{edu.degree || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Institute Name</label>
                    <p className="mt-1">{edu.institute || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Passing Year</label>
                    <p className="mt-1">{edu.passingYear || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {employee.work_experience && employee.work_experience.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.work_experience.map((exp, idx) => (
              <div key={idx} className="border p-4 rounded-lg mb-3 last:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employer</label>
                    <p className="mt-1 font-semibold">{exp.employer || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                    <p className="mt-1">{exp.jobTitle || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="mt-1">{exp.startDate} to {exp.endDate || 'Present'}</p>
                  </div>
                </div>
                {exp.responsibilities && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Key Responsibilities</label>
                    <p className="mt-1 text-gray-700">{exp.responsibilities}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {employee.resume && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={employee.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              📄 View Resume
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
