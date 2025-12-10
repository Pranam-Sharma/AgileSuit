'use client';

import * as React from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserRole } from '@/app/actions/role';

export function useUserRole() {
    const [role, setRole] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setRole(null);
                setLoading(false);
                return;
            }

            try {
                const userRole = await getUserRole(user.uid);
                setRole(userRole || null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { role, loading, isOwner: role === 'owner', isAdmin: role === 'admin' || role === 'owner' };
}
