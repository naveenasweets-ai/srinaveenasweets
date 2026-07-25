import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import CustomDropdown from '../components/CustomDropdown';
import CircularProgress from '../components/CircularProgress';

const SORTS = [
  { label: 'Featured', value: 'default' },
  { label: 'Price: Low → High', value: 'price-low' },
  { label: 'Price: High → Low', value: 'price-high' },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    products,
    setSelectedCategory,
    siteContent,
    freeDeliveryProgress,
    cartTotal,
  } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const selectedCategoryConfig = useMemo(() => {
    if (!slug || slug === 'all') return null;

    return (
      siteContent.categories.find((cat) => {
        const slugMatch = cat.slug === slug;
        const nameMatch = slugify(cat.name) === slug;
        return slugMatch || nameMatch;
      }) ?? null
    );
  }, [siteContent.categories, slug]);

  const categoryName = selectedCategoryConfig?.name ?? 'All';
  const isSubcategory = selectedCategoryConfig?.type === 'subcategory';

  useEffect(() => {
    setSelectedCategory(categoryName);
  }, [categoryName, setSelectedCategory]);

  const filtered = products
    .filter((p) => {
      const matchCat =
        categoryName === 'All'
          ? true
          : isSubcategory
            ? p.subcategory === categoryName
            : p.category === categoryName;
      const matchSrch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSrch;
    })
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return 0;
    });

  const moreAway = Math.max(
    siteContent.charges.freeDeliveryThreshold - cartTotal,
    0,
  );

  return (
    <div className="min-h-screen bg-[#fff8ef] relative">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#5f1021_0%,#2b0707_100%)] px-4 py-8 text-[#fff8ef] sm:px-8 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,209,102,0.18),transparent_45%)] opacity-80" />
        <div className="relative mx-auto max-w-7xl lg:px-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-[#f3d48a] sm:text-4xl">
            {categoryName === 'All' ? 'Everything is here' : categoryName}
          </h1>
          <p className="text-sm text-[#fff8ef]/70">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[28px] border border-[#f3d48a]/70 bg-[#fffdf7] p-3 shadow-[0_18px_45px_rgba(95,16,33,0.06)]">
          <div className="relative min-w-45 flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f1021]/70"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] py-2 pl-9 pr-4 text-sm text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-[#f3d48a]/50 placeholder:text-[#8a6a4a]"
            />
          </div>
          <div className="flex items-center gap-2">
            <CustomDropdown
              options={SORTS}
              value={sort}
              onChange={setSort}
              placeholder="Featured"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="cursor-pointer text-xs font-semibold text-[#5f1021] underline transition hover:text-[#2b0707]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-4xl border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] py-20 text-center shadow-[0_18px_45px_rgba(95,16,33,0.06)]">
            <h3 className="mb-2 font-display text-xl font-bold text-[#5f1021]">
              No items found
            </h3>
            <p className="mb-4 text-sm text-[#8a6a4a]">
              Try changing the category or clearing your search.
            </p>
            <button
              onClick={() => {
                setSearch('');
                navigate('/category/all');
              }}
              className="rounded-full bg-[#5f1021] px-5 py-2.5 text-sm font-bold text-[#fff8ef] transition-colors hover:bg-[#2b0707]"
            >
              Show all items
            </button>
          </div>
        )}
      </div>

      <CircularProgress
        visible={freeDeliveryProgress !== 0}
        progress={freeDeliveryProgress}
        size={34}
        strokeWidth={6}
        message={`${
          moreAway === 0
            ? 'Free delivery unlocked'
            : `Add ₹${moreAway} more for free delivery`
        }`}
        cartText="Cart"
        onCartClick={() => navigate('/cart')}
      />
    </div>
  );
}
