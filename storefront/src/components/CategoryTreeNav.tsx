import { Link } from 'react-router-dom';

import type { CategoryTreeNodeDto } from '@/features/catalog/types';

type Props = {
  nodes: CategoryTreeNodeDto[];
  depth?: number;
};

export function CategoryTreeNav({ nodes, depth = 0 }: Props) {
  if (!nodes.length) {
    return null;
  }
  return (
    <ul className={depth ? 'ml-2 mt-1 space-y-1 border-l border-neutral-200 pl-2' : 'space-y-1'}>
      {nodes.map((n) => (
        <li key={n.id}>
          <Link
            to={`/category/${encodeURIComponent(n.slug)}`}
            className="text-sm text-neutral-700 hover:text-neutral-900 hover:underline"
          >
            {n.name}
          </Link>
          {n.children?.length ? <CategoryTreeNav nodes={n.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}
