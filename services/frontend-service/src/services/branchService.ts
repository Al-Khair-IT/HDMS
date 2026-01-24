export interface Branch {
    id?: string;
    branch_id: string;
    branch_code: string;
    branch_name: string;
    institution_code: string;
    status: string;
    address?: string | null;
    city?: string | null;
    contact_number?: string | null;
    email?: string | null;
    branch_head_name?: string | null;
}

export const fetchBranches = async (institutionCode?: string) => {
    try {
        const url = institutionCode
            ? `http://localhost:8000/api/branches?institution_code=${institutionCode}`
            : 'http://localhost:8000/api/branches';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch branches');
        const data = await res.json();
        return { data, error: null };
    } catch (err: any) {
        return { data: null, error: err.message };
    }
};

export const createBranch = async (payload: Partial<Branch>) => {
    try {
        const res = await fetch('http://localhost:8000/api/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create branch');
        const data = await res.json();
        return { data, error: null };
    } catch (err: any) {
        return { data: null, error: err.message };
    }
};
