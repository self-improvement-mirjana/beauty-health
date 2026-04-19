export type AdminCmsPageSummary = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
};

export type AdminCmsPageDetail = AdminCmsPageSummary & {
  bodyMarkdown: string;
};

export type AdminCmsPageUpsertBody = {
  slug: string;
  title: string;
  bodyMarkdown: string;
  published: boolean;
};

export type AdminRetailLocation = {
  id: number;
  name: string;
  address: string;
  phone: string;
  hoursText: string;
  sortOrder: number;
  active: boolean;
};

export type AdminRetailLocationUpsertBody = {
  name: string;
  address: string;
  phone: string;
  hoursText: string;
  sortOrder: number;
  active: boolean;
};

export type AdminBlogPostSummary = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
};

export type AdminBlogPostDetail = AdminBlogPostSummary & {
  excerpt: string | null;
  bodyMarkdown: string;
};

export type AdminBlogPostUpsertBody = {
  slug: string;
  title: string;
  excerpt: string | null;
  bodyMarkdown: string;
  published: boolean;
  publishedAt: string | null;
};
