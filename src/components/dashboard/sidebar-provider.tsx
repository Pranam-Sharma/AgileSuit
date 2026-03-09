'use client';

import * as React from 'react';

type SidebarContextType = {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Load state from localStorage on mount
    React.useEffect(() => {
        const savedState = localStorage.getItem('sidebar:collapsed');
        if (savedState !== null) {
            setIsCollapsed(savedState === 'true');
        }
    }, []);

    // Save state to localStorage whenever it changes
    const handleSetCollapsed = React.useCallback((value: boolean) => {
        setIsCollapsed(value);
        localStorage.setItem('sidebar:collapsed', String(value));
    }, []);

    const toggleSidebar = React.useCallback(() => {
        handleSetCollapsed(!isCollapsed);
    }, [isCollapsed, handleSetCollapsed]);

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                setIsCollapsed: handleSetCollapsed,
                toggleSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
