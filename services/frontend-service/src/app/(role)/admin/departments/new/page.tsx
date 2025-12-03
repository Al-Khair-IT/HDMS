'use client';

import React from 'react';
import DepartmentForm from '../../../../../components/admin/DepartmentForm';

const NewDepartmentPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <DepartmentForm />
    </div>
  );
};

export default NewDepartmentPage;
