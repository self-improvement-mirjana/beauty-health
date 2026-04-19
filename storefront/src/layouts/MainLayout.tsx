import { Outlet } from 'react-router-dom';

import { AddToCartSearchParamsBanner } from '@/components/AddToCartSearchParamsBanner';
import { AuthBootstrap } from '@/components/AuthBootstrap';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export function MainLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Preskoči na sadržaj
      </a>
      <AddToCartSearchParamsBanner />
      <AuthBootstrap />
      <div className="flex min-h-full flex-col">
        <Header />
        <main id="main-content" className="flex-1 bg-white" tabIndex={-1}>
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
