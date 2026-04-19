export type AdminUserSupport = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  orderCount: number;
};

export type AdminReviewRow = {
  id: number;
  productSlug: string;
  productTitle: string;
  authorName: string;
  authorEmail: string;
  publicEmail: boolean;
  rating: number;
  body: string;
  approved: boolean;
  createdAt: string;
};
