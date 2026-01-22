import type { Metadata } from 'next';
import '@/styles/index.css';

export const metadata: Metadata = {
    title: 'Shipping App',
    description: 'Intercity Shipping & Delivery Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
