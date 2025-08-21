import './globals.css'
import { GlobalErrorBoundary } from '@/components/error/global-error-boundary';
import { ClientLayout } from '@/components/layout/client-layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          <ClientLayout>
            {children}
          </ClientLayout>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
