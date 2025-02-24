import dynamic from 'next/dynamic';

// Create a dynamic component with SSR disabled
const ConnectionsPageClient = dynamic(() => import('./ConnectionsPageClient'), {
  ssr: false,
});

export default function ConnectionsPage() {
  return <ConnectionsPageClient />;
} 