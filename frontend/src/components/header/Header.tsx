import { Link } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import LeftDrawer from './Drawer';
import { useStore } from '../../context/StoreContext';
import Location from './Location';
import Search from './Search';
import Appbar from './Appbar';
import { FcGoogle } from 'react-icons/fc';
import { useRef, useState, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import { allNavItems, menuItems } from '../../utils/constants';
import AuthApi from '../../api/auth';
import { FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { user } = useStore();
  const { loginWithGoogle, logout } = AuthApi();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="w-full z-999 py-4 flex flex-col items-center gap-4 border-b border-(--color-accent-light) bg-(--color-surface) shadow-sm">
      <div className="lg:flex lg:justify-around lg:px-4 w-full">
        {window.innerWidth > 768 && (
          <Link to="/" className="w-[8em]">
            <img src={logo} alt="Sri Naveena Sweets logo" className="w-full" />
          </Link>
        )}

        <div className="flex-col justify-center pb-4 lg:flex hidden">
          <nav className="lg:flex lg:items-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {window.innerWidth > 768 ? (
                  allNavItems.map((item, index) => (
                    <Link
                      to={item.linkTo}
                      key={index}
                      className="cursor-pointer text-(--color-text) hover:font-semibold hover:text-(--color-primary) whitespace-nowrap font-googleNunito tracking-[1px] flex justify-center px-2 py-1"
                    >
                      {item.title}
                    </Link>
                  ))
                ) : (
                  <LeftDrawer visibleNavItems={allNavItems} />
                )}
              </div>
            </div>
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
            <div className="flex gap-1 items-center justify-between font-normal ">
              <Location />
              {user.loggedIn ? (
                <div ref={wrapperRef} className="relative flex text-center">
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
                <button onClick={loginWithGoogle} className="flex items-center gap-1 bg-google-button-blue rounded-full p-0.5 bg-transparent! transition-colors duration-300 hover:bg-google-button-blue-hover hover:underline">
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
          <Search />
        </div>
      </div>
      <Appbar />
    </div>
  );
};

export default Header;
