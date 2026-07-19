import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import CustomerUtils from '../../utils/customer';
import { generateSlug, stripHtml } from '../../utils/utils';

const WishlistPage = () => {
  const { products, wishlist } = useStore();
  const { toggleWishlist } = CustomerUtils();
  const savedItems = products.filter((p) => wishlist.includes(p._id));

  return savedItems && savedItems.length > 0 ? (
    <div
      className="lg:min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="w-fit rounded-full px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-primary)',
          }}
        >
          Whishlist - {savedItems.length}{' '}
          {savedItems.length === 1 ? 'item' : 'items'}
        </div>

        <div className="hidden lg:block space-y-4">
          {savedItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-6 rounded-2xl border p-5 shadow-sm transition duration-200 hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Link
                to={`/product/${generateSlug(item._id, item.name)}`}
                className="h-36 w-44 shrink-0 overflow-hidden rounded-xl"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex-1">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {item.name}
                </h2>
                <p
                  className="mt-2 max-w-2xl text-sm truncate"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {stripHtml(item.description)}
                </p>
                <p
                  className="mt-4 text-lg font-semibold"
                  style={{ color: 'var(--color-accent)' }}
                >
                  ₹ {item.price}.00
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggleWishlist(item._id)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-on-primary)',
                  }}
                >
                  Remove
                </button>
                <Link
                  to={`/product/${generateSlug(item._id, item.name)}`}
                  className="rounded-lg border px-4 py-2 text-center text-sm font-medium transition"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-primary)',
                  }}
                >
                  View product
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:hidden">
          {savedItems.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Link
                to={`/product/${generateSlug(item._id, item.name)}`}
                className="block h-48"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="space-y-3 p-4">
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {item.name}
                  </h2>
                  <p
                    className="mt-1 text-sm truncate"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {stripHtml(item.description)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    ₹ {item.price}.00
                  </p>
                  <button
                    onClick={() => toggleWishlist(item._id)}
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <h4
          className="text-2xl font-semibold sm:text-3xl"
          style={{ color: 'var(--color-muted)' }}
        >
          No items in wishlist
        </h4>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text)' }}>
          Browse our sweets and save your favorites for later.
        </p>
      </div>
    </div>
  );
};

export default WishlistPage;
