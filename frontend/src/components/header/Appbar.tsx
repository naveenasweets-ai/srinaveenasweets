import { Link } from 'react-router-dom';

import { FiShoppingCart } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { GrFavorite } from 'react-icons/gr';
import { IoHomeOutline } from 'react-icons/io5';

import NavbarItems from './NavbarItems';

const Appbar = () => {
  return (
    <div className="flex justify-center fixed bottom-0 w-full lg:hidden z-999 ">
      <div className="bg-(--primary-bg) flex w-full items-center text-white py-1">
        <div className="w-[40%] flex justify-evenly">
          <NavbarItems />

          <Link
            to="/profile"
            className="flex justify-center items-center text-[1.6rem] text-white"
          >
            <FaRegUser />
          </Link>
        </div>

        <div className="w-[20%] flex justify-center">
          <Link
            to="/"
            className="absolute bottom-0 bg-white border-4 border-(--primary-bg) rounded-[50%] p-4"
          >
            <IoHomeOutline className="text-[2rem] text-(--buttons-bg)" />
          </Link>
        </div>

        <div className="w-[40%] flex justify-evenly">
          <Link to="/favorites" className="text-[1.6rem] text-white">
            <GrFavorite />
          </Link>
          <Link to="/cart">
            <FiShoppingCart className="text-[1.6rem] text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Appbar;
