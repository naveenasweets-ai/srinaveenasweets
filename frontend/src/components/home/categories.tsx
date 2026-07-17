/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../SectionHeader';
import { generateSlug, slugify } from '../../utils/utils';
import { useStore } from '../../context/StoreContext';
import { FaChevronRight } from 'react-icons/fa';

export default function Categories() {
  const navigate = useNavigate();
  const { setSelectedCategory, siteContent, handpickedCats, products } =
    useStore();

  const handPickedProducts =
    siteContent?.categoriesInfo?.selectedCategories || [];

  const selectedCategories: any[] = siteContent?.categories
    ?.map((cat) => {
      if (handpickedCats?.includes(cat.name)) {
        const handPickedProds = handPickedProducts.find(
          (item) => item.name === cat.name,
        )?.selectedProducts;

        return {
          ...cat,
          selectedProducts: products.filter((prod) =>
            handPickedProds?.includes(prod._id),
          ),
        };
      }
    })
    .filter((cat) => cat !== undefined) as any[];

  return (
    <>
      <section id="categories" className="py-16 sm:py-20 lg:py-24 bg-[#fff8ef]">
        <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
          <SectionHeader
            title={siteContent?.categoriesInfo?.title || 'Our Categories'}
            subtitle={siteContent?.categoriesInfo?.description || ''}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10">
            {selectedCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigate(`/category/${cat.slug || slugify(cat.name)}`);
                }}
                className="group overflow-hidden rounded-[1.75rem] border border-[#f7d98b]/40 bg-white shadow-[0_28px_55px_-35px_rgba(95,16,33,0.75)] transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
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
                  <p className="text-sm sm:text-base text-[#5f1021]/80 mb-4 hidden lg:flex">
                    {cat.description ||
                      'Explore our delicious range of products in this category.'}
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

      {selectedCategories.map((cat) => (
        <section key={cat._id}>
          <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 mb-18">
            <SectionHeader
              title={`${cat.name}`}
              subtitle={cat.description || ''}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10">
              {cat.selectedProducts.length > 0 ? (
                cat.selectedProducts.map((product: any) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      navigate(
                        `/product/${generateSlug(product._id, product.name)}`,
                      );
                    }}
                    className="group overflow-hidden rounded-[1.75rem] border border-[#f7d98b]/40 bg-white shadow-[0_28px_55px_-35px_rgba(95,16,33,0.75)] transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-semibold text-[#5f1021] mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base text-[#5f1021]/80 mb-4 hidden lg:flex">
                        {product.description || ''}
                      </p>
                      <div className="text-sm font-semibold text-[#9f6c2a]">
                        ₹{product.price.toLocaleString('en-IN')}
                        {product.gstIncluded && (
                          <span className="ml-1.5 rounded bg-[#fff3e0] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9f6c2a]">
                            + GST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#5f1021]/80 py-4">
                  No products available for this category
                </p>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
