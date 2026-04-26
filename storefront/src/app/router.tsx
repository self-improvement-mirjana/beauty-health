import { createBrowserRouter } from 'react-router-dom';

import { RequireAuth } from '@/components/RequireAuth';
import { AccountLayout } from '@/layouts/AccountLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { AccountBuyAgainPage } from '@/pages/AccountBuyAgainPage';
import { AccountDashboardPage } from '@/pages/AccountDashboardPage';
import { AccountInformationPage } from '@/pages/AccountInformationPage';
import { AccountOrderDetailPage } from '@/pages/AccountOrderDetailPage';
import { AccountOrdersPage } from '@/pages/AccountOrdersPage';
import { BlogPage } from '@/pages/BlogPage';
import { BrandPage } from '@/pages/BrandPage';
import { BrandsIndexPage } from '@/pages/BrandsIndexPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { CmsPage } from '@/pages/CmsPage';
import { HomePage } from '@/pages/HomePage';
import { LocationsPage } from '@/pages/LocationsPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProductPage } from '@/pages/ProductPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShopPage } from '@/pages/ShopPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { ACCOUNT_ORDER_DETAIL_ROUTE_ID, ACCOUNT_ORDERS_LIST_ROUTE_ID } from '@/lib/accountRouteIds';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'brands', element: <BrandsIndexPage /> },
      { path: 'brand/:slug', element: <BrandPage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'locations', element: <LocationsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'account',
        element: <RequireAuth />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountDashboardPage /> },
              { path: 'informacije', element: <AccountInformationPage /> },
              { path: 'porudzbine', id: ACCOUNT_ORDERS_LIST_ROUTE_ID, element: <AccountOrdersPage /> },
              { path: 'porudzbina/:orderId', id: ACCOUNT_ORDER_DETAIL_ROUTE_ID, element: <AccountOrderDetailPage /> },
              { path: 'ponovo-kupi', element: <AccountBuyAgainPage /> },
            ],
          },
        ],
      },
      { path: 'payment/return', element: <PaymentReturnPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout',
        element: <RequireAuth />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
      { path: 'search', element: <SearchPage /> },
      { path: 'p/:slug', element: <ProductPage /> },
      { path: 'lista-zelja', element: <WishlistPage /> },
      { path: 'pages/:slug', element: <CmsPage /> },
    ],
  },
]);
