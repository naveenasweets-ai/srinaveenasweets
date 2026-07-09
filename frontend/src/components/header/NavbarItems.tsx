import { Link } from 'react-router-dom';

import { FaBirthdayCake, FaHotdog, FaCookieBite } from 'react-icons/fa';
import { LuDessert } from 'react-icons/lu';
import {
  MdCelebration,
  MdOutlineFestival,
  MdOutlineInfo,
} from 'react-icons/md';

import LeftDrawer from './Drawer';

const Navbar = () => {
  const allNavItems = [
    { title: 'Sweets', linkTo: 'sweets', itemIcon: <LuDessert /> },
    { title: 'Cakes', linkTo: 'cakes', itemIcon: <FaBirthdayCake /> },
    { title: 'Hot Items', linkTo: 'hot_items', itemIcon: <FaHotdog /> },
    { title: 'Biscuits', linkTo: 'biscuits', itemIcon: <FaCookieBite /> },
    {
      title: 'Occasions',
      linkTo: 'occasion',
      itemIcon: <MdOutlineFestival />,
    },
    {
      title: 'Decorations',
      linkTo: 'decoration',
      itemIcon: <MdCelebration />,
    },
    { title: 'About us', linkTo: 'about', itemIcon: <MdOutlineInfo /> },
  ];

  return (
    <nav className="lg:flex lg:items-center">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {window.innerWidth > 768 ? (
            allNavItems.map((item, index) => (
              <Link
                to={item.linkTo}
                key={index}
                className="cursor-pointer text-[var(--color-text)] hover:font-[600] hover:text-[var(--color-primary)] whitespace-nowrap font-googleNunito tracking-[1px] flex justify-center px-2 py-1"
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
  );
};

export default Navbar;
