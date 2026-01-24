'use client';

import React from 'react';
import BranchForm from '../../../../../components/admin/BranchForm';

const NewBranchPage: React.FC = () => {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <Card className="bg-white rounded-2xl shadow-xl border-0 mb-6">
                <CardContent className="p-4">
                    <p className="text-amber-700 text-sm font-medium">
                        Note: Branches represent physical campuses or locations under an Institution.
                    </p>
                </CardContent>
            </Card>
            <BranchForm />
        </div>
    );
};

// Simple Card wrapper since we are in a sub-page
const Card = ({ children, className }: any) => <div className={className}>{children}</div>;
const CardContent = ({ children, className }: any) => <div className={className}>{children}</div>;

export default NewBranchPage;
