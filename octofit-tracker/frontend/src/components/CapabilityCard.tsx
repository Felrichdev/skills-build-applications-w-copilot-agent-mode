import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  render: (data: T) => ReactNode;
  isEmpty: (data: T) => boolean;
  emptyMessage: string;
};

export function CapabilityCard<T>({ title, description, load, render, isEmpty, emptyMessage }: Props<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);

    void load()
      .then((json) => {
        if (!active) return;
        setData(json);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load data');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [load]);

  if (loading) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">Loading…</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="alert">Unable to load data: {error}</p></div></section>;
  }

  if (data === null || isEmpty(data)) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">{emptyMessage}</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">Data loaded</p>{render(data)}</div></section>;
}
