'use client';

import React from 'react';
import InstitutionForm from '../../../../../components/admin/InstitutionForm';

const NewInstitutionPage: React.FC = () => {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <InstitutionForm />
        </div>
    );
};

export default NewInstitutionPage;
