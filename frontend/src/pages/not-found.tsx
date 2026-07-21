import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}
        >
          <span
            className="text-4xl font-bold"
            style={{ color: 'var(--color-accent)' }}
          >
            404
          </span>
        </div>
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: 'var(--color-primary)' }}
        >
          Page Not Found
        </h1>
        <p
          className="mt-4 text-base leading-relaxed"
          style={{ color: 'var(--color-muted)' }}
        >
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-on-primary)',
            }}
          >
            Go to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-semibold transition"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary)',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
