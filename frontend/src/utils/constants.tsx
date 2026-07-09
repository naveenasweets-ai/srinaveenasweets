

import {
  MdCelebration,
  MdOutlineFestival,
} from 'react-icons/md';
import { FiShoppingCart } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { GrFavorite } from 'react-icons/gr';
import { FaBirthdayCake, FaHotdog, FaCookieBite } from 'react-icons/fa';
import { LuDessert } from 'react-icons/lu';

export const allNavItems = [
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
  ];

  
   export const menuItems = [
      { name: 'Profile', to: 'profile', icon: <FaRegUser className="text-lg" /> },
      { name: 'Favorites', to: 'favorites', icon: <GrFavorite className="text-lg" /> },
      { name: 'Cart', to: 'cart', icon: <FiShoppingCart className="text-lg" /> },
    ];
