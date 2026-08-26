import React from 'react';
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { Layout } from './components/layout/Layout';
import { CamerasPage } from './pages/cameras';
import { CameraDetailPage } from './pages/cameras/$cameraId';
import { EventsPage } from './pages/events';
import { SocMapPage } from './pages/soc/map';
import { IncidentsPage } from './pages/incidents';
import { AnalyticsPage } from './pages/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Route definitions ─────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw new Response(null, { status: 302, headers: { Location: '/cameras' } });
  },
});

const camerasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cameras',
  component: CamerasPage,
});

const cameraDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cameras/$cameraId',
  component: CameraDetailPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const socMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/soc/map',
  component: SocMapPage,
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/incidents',
  component: IncidentsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  camerasRoute,
  cameraDetailRoute,
  eventsRoute,
  socMapRoute,
  incidentsRoute,
  analyticsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App Entry ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
