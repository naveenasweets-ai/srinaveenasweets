import jwt from 'jsonwebtoken';
import SiteConfigSchema from '../schemas/siteConfig.js';

export const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

export const getOrCreateSiteConfig = async () => {
  let siteConfig = await SiteConfigSchema.findOne();
  if (!siteConfig) {
    siteConfig = await SiteConfigSchema.create({});
  }
  return siteConfig;
};

export const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};