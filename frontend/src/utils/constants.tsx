import { MdCelebration, MdOutlineFestival } from 'react-icons/md';
import { FiShoppingCart } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { GrFavorite } from 'react-icons/gr';
import { FaBirthdayCake, FaHotdog, FaCookieBite } from 'react-icons/fa';
import { MdOutlineDashboardCustomize } from 'react-icons/md';
import { LuDessert } from 'react-icons/lu';
import { MdDeliveryDining } from 'react-icons/md';
import { RiSecurePaymentFill, RiCake3Fill } from 'react-icons/ri';
import { VscPackage } from 'react-icons/vsc';

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

export const customerMenuItems = [
  {
    name: 'Favorites',
    to: 'favorites',
    icon: <GrFavorite className="text-lg" />,
  },
  { name: 'Cart', to: 'cart', icon: <FiShoppingCart className="text-lg" /> },
  { name: 'Orders', to: 'my-orders', icon: <VscPackage /> },
];

export const adminMenuItems = [
  {
    name: 'Dashboard',
    to: 'admin-dashboard',
    icon: <FiShoppingCart className="text-lg" />,
  },
  {
    name: 'Products',
    to: 'admin-products',
    icon: <FaRegUser className="text-lg" />,
  },
  {
    name: 'Orders',
    to: 'admin-orders',
    icon: <GrFavorite className="text-lg" />,
  },
  {
    name: 'Customize App',
    to: 'app-customize',
    icon: <MdOutlineDashboardCustomize className="text-lg" />,
  },
];

export const ICON_SET = [
  {
    name: 'Fast Delivery',
    svg: <MdDeliveryDining />,
  },
  {
    name: 'Secure Payments',
    svg: <RiSecurePaymentFill />,
  },
  {
    name: 'Delicious Sweets',
    svg: <RiCake3Fill />,
  },
  {
    name: 'Occasional Items',
    svg: <MdOutlineFestival />,
  },
];
