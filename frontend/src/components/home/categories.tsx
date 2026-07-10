import { useNavigate } from 'react-router-dom';
import SectionHeader from '../SectionHeader';
import { slugify } from '../../utils/utils';
import { useStore } from '../../context/StoreContext';
import { FaChevronRight } from 'react-icons/fa';

export default function Categories() {
  const navigate = useNavigate();
  const { setSelectedCategory, siteContent } = useStore();

  return (
    <section id="collections" className="py-16 sm:py-20 lg:py-24 bg-[#fff8ef]">
      <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
        <SectionHeader
          title={siteContent?.categoriesInfo?.title || 'Our Categories'}
          subtitle={siteContent?.categoriesInfo?.description || ''}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {siteContent.categories
            .filter(
              (cat) => cat.type !== 'subcategory' && cat.isActive !== false,
            )
            .slice(0, 4)
            .map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigate(`/category/${slugify(cat.name)}`);
                }}
                className="group overflow-hidden rounded-[1.75rem] border border-[#f7d98b]/40 bg-white shadow-[0_28px_55px_-35px_rgba(95,16,33,0.75)] transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* <div className="absolute inset-0 bg-linear-to-t from-[#5f1021]/80 via-transparent to-transparent" /> */}
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#5f1021] mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-sm sm:text-base leading-7 text-[#5f1021]/80 mb-4 min-h-12">
                    {cat.description || 'Explore our delicious range of products in this category.'}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#9f6c2a] transition-colors group-hover:text-[#7a1a2d]">
                    EXPLORE
                    <FaChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
