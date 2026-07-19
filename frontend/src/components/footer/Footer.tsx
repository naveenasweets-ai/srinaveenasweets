import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import logo_path from '../../assets/Logo.png';
import { useStore } from '../../context/StoreContext';

const Footer = () => {
  const { siteContent } = useStore();

  const allNavItems = siteContent?.categoriesInfo?.selectedCategories ?? [];

  return (
    <Box
      sx={{
        bgcolor: 'var(--color-surface)',
        color: 'var(--color-text)',
        pt: 6,
        pb: 2,
        borderTop: '1px solid',
        borderColor: 'var(--color-accent-light)',
      }}
    >
      <Container sx={{ width: '100%' }}>
        <div className="flex lg:flex-row relative flex-col w-full">
          <Link to="/" className="flex w-[10em] lg:absolute">
            <img src={logo_path} alt="" className="w-full h-full" />
          </Link>

          <div className="w-full flex lg:flex-col justify-between lg:justify-start px-6 lg:pl-[12em] py-2 gap-6">
            <div className="flex flex-col lg:flex-row justify-center lg:gap-12 gap-2">
              {allNavItems.map((item, i) => {
                return (
                  <Link
                    key={i}
                    to={`/category/${item.slug}`}
                    className="no-underline text-[var(--color-text)] w-fit hover:text-[var(--color-primary-dark)] hover:underline"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col lg:flex-row justify-center lg:gap-12 gap-2">
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
        <div className="w-full flex flex-col items-center justify-center gap-3 mt-6 mb-2">
          <Typography
            component="p"
            variant="body1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'var(--color-text)',
            }}
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
            - Sri Naveena Sweets and Bakery -
          </Typography>

          <hr className="w-full border-[#c8a96b]" />

          <Typography
            component="p"
            variant="body1"
            className="flex justify-center gap-2 items-center"
            sx={{ color: 'var(--color-text)', pt: 2 }}
          >
            visit dev -
            <a
              href="https://vamshidhar.dev/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent-dark)] no-underline hover:underline"
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
