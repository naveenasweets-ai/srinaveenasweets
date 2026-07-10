import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import logo_path from '../../assets/Logo.png';

import { SiMongodb, SiExpress, SiReact, SiNodedotjs } from 'react-icons/si';
import Search from '../header/Search';

const Footer = () => {
  const allNavItems = [
    { title: 'Sweets', linkTo: 'sweets' },
    { title: 'Cakes', linkTo: 'cakes' },
    { title: 'Hot Items', linkTo: 'hot_items' },
    { title: 'Biscuits', linkTo: 'biscuits' },
  ];

  return (
    <Box
      sx={{
        bgcolor: 'var(--color-surface)',
        color: 'var(--color-text)',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'var(--color-accent-light)',
        pb: { xs: '2em', md: 0 },
      }}
    >
      <Container sx={{ width: '100%' }}>
        <div className="flex lg:flex-row relative flex-col gap-4 w-full">
          <Link to="/" className="flex w-[10em] lg:absolute">
            <img src={logo_path} alt="" className="w-full h-full" />
          </Link>

          <div className="w-full flex lg:flex-col justify-between lg:justify-start px-6 gap-4">
            <div className="flex flex-col lg:flex-row justify-center lg:gap-12">
              {allNavItems.map((item, i) => {
                return (
                  <Link
                    key={i}
                    to={`/${item.linkTo}`}
                    className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col lg:flex-row justify-center lg:gap-12">
              <Link
                to="/terms-and-conditions"
                className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
              >
                Terms and Conditions
              </Link>

              <Link
                to="/privacy-policy"
                className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
              >
                Privacy Policy
              </Link>

              <Link
                to="/return-cancellations"
                className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
              >
                Returns/Cancellations
              </Link>

              <Link
                to="/shipping-policy"
                className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[450px]  mx-auto flex items-center justify-center my-[25px]">
          <Search />
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-3 my-3">
          <Typography
            component="p"
            variant="body1"
            sx={{ display: 'flex', gap: '4px', color: 'var(--color-text)' }}
          >
            Follow us on
            <a
              aria-label="Instagram"
              className="text-2xl text-[var(--color-accent-dark)]"
              target="_blank"
              rel="noreferrer noopener"
              href="https://www.instagram.com/srinaveenasweets?utm_source=qr&igsh=MXUyNTRlNGZpYm1yMA=="
            >
              <FaInstagram />
            </a>
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'var(--color-text)' }}
          >
            Sri Naveena Sweets and Bakery
          </Typography>

          <hr className="w-full border-[#c8a96b]" />

          <Typography
            component="p"
            variant="body1"
            className="flex justify-center gap-2 items-center"
            sx={{ color: 'var(--color-text)' }}
          >
            made with
            <span className="flex gap-1 text-[var(--color-accent-dark)]">
              <SiMongodb />
              <SiExpress />
              <SiReact />
              <SiNodedotjs />
            </span>
            <a
              href="https://vamshidharonline.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--color-accent-dark)]"
            >
              vamshidhar dawoor
            </a>
          </Typography>
        </div>
      </Container>
    </Box>
  );
};

export default Footer;
