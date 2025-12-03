'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';

interface Department {
	dept_code: string;
	dept_name: string;
}

interface Designation {
	position_code: string;
	position_name: string;
}

interface Employee {
	employee_id: string;
	employee_code: string;
	full_name: string;
	email: string;
	phone: string;
	department: Department | null;
	designation: Designation | null;
	employment_type: string;
	employment_type_value: string;
	joining_date: string | null;
	created_at: string | null;
}

interface EmployeeListResponse {
	employees: Employee[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}

const EmployeesListPage: React.FC = () => {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	// Filters
	const [search, setSearch] = useState('');
	const [searchDebounced, setSearchDebounced] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [designationFilter, setDesignationFilter] = useState('');
	const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');

	// Dropdown data
	const [departments, setDepartments] = useState<any[]>([]);
	const [designations, setDesignations] = useState<any[]>([]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchDebounced(search);
			setPage(1); // Reset to page 1 on search
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	// Fetch departments and designations for filters
	useEffect(() => {
		const fetchDropdowns = async () => {
			try {
				const [deptsRes, desigsRes] = await Promise.all([
					fetch('http://localhost:8000/api/departments'),
					fetch('http://localhost:8000/api/designations')
				]);
				const [deptsData, desigsData] = await Promise.all([
					deptsRes.json(),
					desigsRes.json()
				]);
				setDepartments(deptsData);
				setDesignations(desigsData);
			} catch (err) {
				console.error('Failed to fetch dropdowns:', err);
			}
		};
		fetchDropdowns();
	}, []);

	// Fetch employees
	useEffect(() => {
		const fetchEmployees = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams({
					page: page.toString(),
					per_page: '20'
				});

				if (searchDebounced) params.append('search', searchDebounced);
				if (departmentFilter) params.append('department', departmentFilter);
				if (designationFilter) params.append('designation', designationFilter);
				if (employmentTypeFilter) params.append('employment_type', employmentTypeFilter);

				const response = await fetch(`http://localhost:8000/api/employees?${params}`);
				const data: EmployeeListResponse = await response.json();

				setEmployees(data.employees || []);
				setTotal(data.total || 0);
				setTotalPages(data.total_pages || 0);
			} catch (err) {
				console.error('Failed to fetch employees:', err);
				setEmployees([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEmployees();
	}, [page, searchDebounced, departmentFilter, designationFilter, employmentTypeFilter]);

	const handleDelete = async (employeeId: string, employeeName: string) => {
		if (!confirm(`Are you sure you want to delete ${employeeName}?`)) {
			return;
		}

		try {
			const response = await fetch(`http://localhost:8000/api/employees/${employeeId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				alert('Employee deleted successfully');
				// Refresh the list
				setPage(1);
				const params = new URLSearchParams({ page: '1', per_page: '20' });
				const refreshResponse = await fetch(`http://localhost:8000/api/employees?${params}`);
				const data = await refreshResponse.json();
				setEmployees(data.employees || []);
				setTotal(data.total || 0);
				setTotalPages(data.total_pages || 0);
			} else {
				alert('Failed to delete employee');
			}
		} catch (err) {
			console.error('Error deleting employee:', err);
			alert('Error deleting employee');
		}
	};

	const clearFilters = () => {
		setSearch('');
		setDepartmentFilter('');
		setDesignationFilter('');
		setEmploymentTypeFilter('');
		setPage(1);
	};

	return (
		<div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
			<Card className="bg-white rounded-2xl shadow-xl border-0">
				<CardHeader className="p-4 md:p-6 lg:p-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<CardTitle className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
								Employees
							</CardTitle>
							<p className="text-sm mt-1" style={{ color: THEME.colors.gray }}>
								Manage employees and their records ({total} total)
							</p>
						</div>
						<Link href="/admin/employees/new">
							<Button variant="primary">+ Add Employee</Button>
						</Link>
					</div>

					{/* Filters */}
					<div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search */}
						<div className="md:col-span-2">
							<input
								type="text"
								placeholder="Search by name, email, or code..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Department Filter */}
						<div>
							<select
								value={departmentFilter}
								onChange={(e) => {
									setDepartmentFilter(e.target.value);
									setPage(1);
								}}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">All Departments</option>
								{departments.map((dept) => (
									<option key={dept.dept_code} value={dept.dept_code}>
										{dept.dept_name}
									</option>
								))}
							</select>
						</div>

						{/* Employment Type Filter */}
						<div>
							<select
								value={employmentTypeFilter}
								onChange={(e) => {
									setEmploymentTypeFilter(e.target.value);
									setPage(1);
								}}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">All Types</option>
								<option value="full_time">Full-time</option>
								<option value="part_time">Part-time</option>
								<option value="contract">Contract</option>
								<option value="intern">Intern</option>
							</select>
						</div>
					</div>

					{/* Clear Filters Button */}
					{(search || departmentFilter || designationFilter || employmentTypeFilter) && (
						<div className="mt-4">
							<Button variant="outline" size="sm" onClick={clearFilters}>
								Clear Filters
							</Button>
						</div>
					)}
				</CardHeader>

				<CardContent className="p-4 md:p-6 lg:p-8">
					{isLoading ? (
						<div className="text-center py-12">
							<p className="text-gray-500">Loading employees...</p>
						</div>
					) : employees.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 mb-4">No employees found</p>
							{(search || departmentFilter || employmentTypeFilter) ? (
								<Button variant="outline" onClick={clearFilters}>
									Clear Filters
								</Button>
							) : (
								<Link href="/admin/employees/new">
									<Button variant="primary">Create First Employee</Button>
								</Link>
							)}
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y">
									<thead>
										<tr className="bg-gray-50">
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Designation</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{employees.map((emp) => (
											<tr key={emp.employee_id} className="hover:bg-gray-50 transition-colors">
												<td className="py-3 px-4 font-medium text-blue-600">{emp.employee_code}</td>
												<td className="py-3 px-4">{emp.full_name}</td>
												<td className="py-3 px-4 text-sm text-gray-600">{emp.email}</td>
												<td className="py-3 px-4 text-sm text-gray-600">{emp.phone || '-'}</td>
												<td className="py-3 px-4">
													{emp.department ? (
														<span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
															{emp.department.dept_name}
														</span>
													) : '-'}
												</td>
												<td className="py-3 px-4 text-sm">{emp.designation?.position_name || '-'}</td>
												<td className="py-3 px-4 text-sm">{emp.employment_type}</td>
												<td className="py-3 px-4">
													<div className="flex gap-2">
														<Link href={`/admin/employees/${emp.employee_id}`}>
															<Button variant="outline" size="sm">View</Button>
														</Link>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDelete(emp.employee_id, emp.full_name)}
															className="text-red-600 hover:bg-red-50"
														>
															Delete
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-6 flex items-center justify-between">
									<p className="text-sm text-gray-600">
										Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} employees
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(p => Math.max(1, p - 1))}
											disabled={page === 1}
										>
											« Previous
										</Button>
										<div className="flex gap-1">
											{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
												const pageNum = i + 1;
												return (
													<Button
														key={pageNum}
														variant={page === pageNum ? 'primary' : 'outline'}
														size="sm"
														onClick={() => setPage(pageNum)}
													>
														{pageNum}
													</Button>
												);
											})}
											{totalPages > 5 && <span className="px-2">...</span>}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(p => Math.min(totalPages, p + 1))}
											disabled={page === totalPages}
										>
											Next »
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default EmployeesListPage;
