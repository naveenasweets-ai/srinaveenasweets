/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import { useStore } from '../../context/StoreContext';
import Location from './Location';
import Search from './Search';
import { FcGoogle } from 'react-icons/fc';
import { useRef, useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { customerMenuItems, adminMenuItems } from '../../utils/constants';
import AuthApi from '../../api/auth';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { slugify } from '../../utils/utils';
import type { CategoryConfig } from '../../types/contextTypes';

const Header = () => {
  const { user, siteContent, setSelectedCategory } = useStore();
  const { loginWithGoogle, logout } = AuthApi();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const menuItems = user.role === 'admin' ? adminMenuItems : customerMenuItems;

  const handleNav = (name: string, slug: string = 'all') => {
    setSelectedCategory(name);
    navigate(`/category/${slug}`);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideProfileMenu = profileMenuRef.current?.contains(target);
      const clickedInsideMobileNav = mobileNavRef.current?.contains(target);

      if (!clickedInsideProfileMenu && !clickedInsideMobileNav) {
        setIsMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    if (isMenuOpen || isMobileNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobileNavOpen]);

  return (
    <div className="w-full z-999 py-4 flex flex-col items-center gap-4 border-b border-(--color-accent-light) bg-(--color-surface) shadow-sm">
      <div className="lg:flex lg:justify-around lg:px-4 w-full">
        {window.innerWidth > 768 && (
          <Link to="/" className="w-[8em]">
            <img src={logo} alt="Sri Naveena Sweets logo" className="w-full" />
          </Link>
        )}

        <div className="flex-col justify-center pb-4 lg:flex hidden">
          <nav className="hidden lg:flex justify-center gap-8 xl:gap-12 pb-2.5 pt-2.5 bg-gradient-to-r from-transparent via-maroon-50/20 to-transparent">
            {siteContent?.categories
              ?.filter((cat: CategoryConfig) => cat.type !== 'subcategory')
              ?.map((cat: CategoryConfig) => ({
                label: cat.name,
                name: cat.name,
                slug: slugify(cat.slug || cat.name),
                isCat: true,
                subcategories: siteContent.categories?.filter(
                  (item: CategoryConfig) =>
                    item.type === 'subcategory' && item.parentId === cat._id,
                ),
              }))
              .map((item: any) => {
                const hasSubmenu = Boolean(item.subcategories?.length);

                return (
                  <div key={item.label} className="relative group">
                    <button
                      onClick={() => {
                        if (item.isCat) {
                          handleNav(item.name, item.slug);
                        } else {
                          navigate('/');
                        }
                      }}
                      className="text-[clamp(0.65rem,0.95vw,0.95rem)] whitespace-nowrap tracking-[0.2em] uppercase font-semibold text-(--color-primary-dark) hover:text-(--color-primary) transition-colors relative py-1.5 cursor-pointer"
                    >
                      {item.label}
                    </button>

                    {hasSubmenu && (
                      <div className="absolute left-1/2 top-full mt-3 w-60 -translate-x-1/2 rounded-2xl border border-(--color-accent-light) bg-(--color-surface) p-2.5 shadow-[0_18px_45px_rgba(95,16,33,0.12)] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 backdrop-blur-sm">
                        {item.subcategories?.map((subcat: CategoryConfig) => (
                          <button
                            key={subcat._id}
                            onClick={() =>
                              handleNav(
                                subcat.name,
                                slugify(subcat.slug || subcat.name),
                              )
                            }
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-(--color-text) transition-colors cursor-pointer whitespace-nowrap hover:bg-(--color-accent-light) hover:text-(--color-primary-dark)"
                          >
                            {subcat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>
        </div>

        <div className="flex flex-col gap-2 px-4 justify-center">
          <div className="flex lg:justify-end justify-between cursor-default pr-2">
            {window.innerWidth < 768 && (
              <Link to="/" className="w-32">
                <img
                  src={logo}
                  alt="Sri Naveena Sweets logo"
                  className="w-full"
                />
              </Link>
            )}
            <div className="flex flex-col lg:gap-1 lg:justify-between items-end justify-end font-normal ">
              <Location />
              {user.loggedIn ? (
                <div ref={profileMenuRef} className="relative flex text-center">
                  <button
                    type="button"
                    onClick={toggleMenu}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                    className="ml-2 rounded-full bg-transparent! p-2 text-gray-700 transition hover:bg-gray-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-800">
                      <CgProfile />
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 min-w-45 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                      {menuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={`/${item.to}`}
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
                        >
                          <span className="min-w-6 text-lg">{item.icon}</span>
                          <span className="flex-1 text-left">{item.name}</span>
                        </Link>
                      ))}

                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        <span className="min-w-6 text-lg">
                          <FiLogOut />
                        </span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1 bg-google-button-blue rounded-full p-0.5 bg-transparent! transition-colors duration-300 hover:bg-google-button-blue-hover hover:underline"
                >
                  <span className="text-black tracking-wider">
                    Signin with{' '}
                  </span>
                  <div className="flex items-center justify-center bg-white w-5 h-5 rounded-full">
                    <FcGoogle />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div ref={mobileNavRef} className="lg:hidden flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleMobileNav}
              className="flex items-center justify-between rounded-full border border-(--color-accent-light) bg-white! px-4 py-2 text-sm font-semibold text-(--color-text) shadow-sm"
            >
              <span>Menu</span>
              <FiChevronDown
                className={`transition-transform ${isMobileNavOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isMobileNavOpen && (
              <div className="flex flex-col gap-1 rounded-xl border border-(--color-accent-light) bg-white p-2 shadow-sm">
                {siteContent?.categories.map((item, index) => (
                  <Link
                    key={index}
                    to={item.slug ? `/category/${item.slug}` : '/category/all'}
                    onClick={closeMobileNav}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-(--color-text) transition hover:bg-(--color-accent-light)"
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Search />
        </div>
      </div>
    </div>
  );
};

export default Header;
