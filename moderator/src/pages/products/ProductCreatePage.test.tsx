import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductCreatePage } from './ProductCreatePage';

const mockNavigate = vi.fn();
const mutate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/api/catalogEndpoints', () => ({
  useListAdminBrandsQuery: () => ({ data: [{ id: 1, name: 'Brend', slug: 'brend' }], isLoading: false }),
  useListAdminCategoriesQuery: () => ({ data: [], isLoading: false }),
  useListStoreLocationsQuery: () => ({
    data: [{ id: 10, name: 'Magacin A', slug: 'magacin-a' }],
    isSuccess: true,
    isLoading: false,
  }),
  useCreateProductMutation: () => [mutate, { isLoading: false }],
}));

describe('ProductCreatePage', () => {
  beforeEach(() => {
    mutate.mockReset();
    mockNavigate.mockReset();
    mutate.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 99, slug: 'm02-rtl-widget' }),
    });
  });

  it('submits minimal product with one variant', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductCreatePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-name')).toBeInTheDocument();
    });

    await user.clear(screen.getByTestId('product-name'));
    await user.type(screen.getByTestId('product-name'), 'RTL proizvod');
    await user.clear(screen.getByTestId('product-slug'));
    await user.type(screen.getByTestId('product-slug'), 'm02-rtl-widget');
    await user.clear(screen.getByTestId('variant-0-sku'));
    await user.type(screen.getByTestId('variant-0-sku'), 'RTL-SKU-1');

    await user.click(screen.getByTestId('product-create-submit'));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });

    const body = mutate.mock.calls[0][0] as {
      slug: string;
      variants: { sku: string; defaultVariant: boolean; inventory: { storeLocationId: number }[] }[];
    };
    expect(body.slug).toBe('m02-rtl-widget');
    expect(body.variants).toHaveLength(1);
    expect(body.variants[0].sku).toBe('RTL-SKU-1');
    expect(body.variants[0].defaultVariant).toBe(true);
    expect(body.variants[0].inventory[0].storeLocationId).toBe(10);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products/m02-rtl-widget/edit', { replace: true });
    });
  });
});
