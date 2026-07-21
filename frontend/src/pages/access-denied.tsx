import { Link } from 'react-router-dom';

const AccessDenied = () => {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            style={{ color: 'var(--color-accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m10.5-7.5a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: 'var(--color-primary)' }}
        >
          Access Denied
        </h1>
        <p
          className="mt-4 text-base leading-relaxed"
          style={{ color: 'var(--color-muted)' }}
        >
          You don't have permission to access this page. Please contact an
          administrator if you believe this is an error.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-on-primary)',
          }}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
