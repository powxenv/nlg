import type { Auth } from '@/types/auth';

declare global {
    type PaginatedData<T> = {
        data: T[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            flash: {
                success?: string | null;
                error?: string | null;
            };
            sidebarOpen: boolean;
        };
    }
}
