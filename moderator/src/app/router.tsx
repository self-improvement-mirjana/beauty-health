import { createBrowserRouter, Navigate } from 'react-router-dom';

import { BootstrapAuth } from '@/components/BootstrapAuth';
import { FallbackNavigate } from '@/components/FallbackNavigate';
import { GuestOnly } from '@/components/GuestOnly';
import { RequireModerator } from '@/components/RequireModerator';
import { ModeratorShell } from '@/layouts/ModeratorShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { LoginPage } from '@/pages/LoginPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { OrdersListPage } from '@/pages/orders/OrdersListPage';
import { ProductCreatePage } from '@/pages/products/ProductCreatePage';
import { ProductEditPage } from '@/pages/products/ProductEditPage';
import { BrandsPage } from '@/pages/brands/BrandsPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { BlogPostsPage } from '@/pages/content/BlogPostsPage';
import { CmsPagesPage } from '@/pages/content/CmsPagesPage';
import { ContentLayout } from '@/pages/content/ContentLayout';
import { RetailLocationsPage } from '@/pages/content/RetailLocationsPage';
import { ProductListPage } from '@/pages/products/ProductListPage';
import { ReviewsModerationPage } from '@/pages/users/ReviewsModerationPage';
import { UserSupportPage } from '@/pages/users/UserSupportPage';
import { UsersLayout } from '@/pages/users/UsersLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <BootstrapAuth>
        <GuestOnly>
          <LoginPage />
        </GuestOnly>
      </BootstrapAuth>
    ),
  },
  {
    path: '/forbidden',
    element: (
      <BootstrapAuth>
        <ForbiddenPage />
      </BootstrapAuth>
    ),
  },
  {
    path: '/',
    element: (
      <BootstrapAuth>
        <RequireModerator />
      </BootstrapAuth>
    ),
    children: [
      {
        element: <ModeratorShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/new', element: <ProductCreatePage /> },
          { path: 'products/:slug/edit', element: <ProductEditPage /> },
          { path: 'brands', element: <BrandsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'orders', element: <OrdersListPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          {
            path: 'content',
            element: <ContentLayout />,
            children: [
              { index: true, element: <Navigate to="cms" replace /> },
              { path: 'cms', element: <CmsPagesPage /> },
              { path: 'locations', element: <RetailLocationsPage /> },
              { path: 'blog', element: <BlogPostsPage /> },
            ],
          },
          {
            path: 'users',
            element: <UsersLayout />,
            children: [
              { index: true, element: <Navigate to="reviews" replace /> },
              { path: 'reviews', element: <ReviewsModerationPage /> },
              { path: 'support', element: <UserSupportPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <BootstrapAuth>
        <FallbackNavigate />
      </BootstrapAuth>
    ),
  },
]);
