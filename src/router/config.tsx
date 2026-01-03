import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

const BranchSelector = lazy(() => import('../pages/branch-selector/page'));
const BranchPage = lazy(() => import('../pages/branch/page'));
const Gallery = lazy(() => import('../pages/gallery/page'));
const Contact = lazy(() => import('../pages/contact/page'));
const AdminLogin = lazy(() => import('../pages/admin/login/page'));
const AdminDashboard = lazy(() => import('../pages/admin/dashboard/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
    <div className="text-white text-xl">Đang tải...</div>
  </div>
);

// Wrapper component for lazy loading
const LazyWrapper = ({ Component }: { Component: React.LazyExoticComponent<() => JSX.Element> }) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

const routes: RouteObject[] = [
  // Admin routes - Đặt trước để ưu tiên
  {
    path: '/admin/login',
    element: <LazyWrapper Component={AdminLogin} />,
  },
  {
    path: '/admin/dashboard',
    element: <LazyWrapper Component={AdminDashboard} />,
  },
  // Branch routes
  {
    path: '/',
    element: <LazyWrapper Component={BranchSelector} />,
  },
  {
    path: '/:branchSlug',
    element: <LazyWrapper Component={BranchPage} />,
  },
  {
    path: '/:branchSlug/gallery',
    element: <LazyWrapper Component={Gallery} />,
  },
  {
    path: '/:branchSlug/contact',
    element: <LazyWrapper Component={Contact} />,
  },
  // 404
  {
    path: '*',
    element: <LazyWrapper Component={NotFound} />,
  },
];

export default routes;
