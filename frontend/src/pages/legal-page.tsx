import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  normalizeLegalPages,
  sanitizeRichHtml,
  isRichHtmlEmpty,
} from '../utils/utils';
import type { LegalPageSlug } from '../types/appContentTypes';

// A single page that renders the content of whichever policy page matches
// the route slug (Terms, Privacy, Returns/Cancellations, Shipping).
export default function LegalPage({ slug }: { slug?: LegalPageSlug }) {
  const params = useParams();
  const { siteContent } = useStore();

  const activeSlug = (slug || params.slug) as LegalPageSlug | undefined;
  const pages = normalizeLegalPages(siteContent?.legalPages);
  const page = pages.find((item) => item.slug === activeSlug);

  const contentHtml = sanitizeRichHtml(page?.content || '');

  return (
    <Container sx={{ py: { xs: 4, md: 8 }, maxWidth: {md: '90vw !important'} }}>
      {page ? (
        <Box
          sx={{
            bgcolor: 'var(--color-surface)',
            borderRadius: 4,
            border: '1px solid var(--color-accent-light)',
            p: { xs: 3, md: 6 },
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              color: 'var(--color-primary-dark)',
              fontWeight: 700,
              mb: 1,
            }}
          >
            {page.title}
          </Typography>

          {page.description && (
            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--color-text)', opacity: 0.8, mb: 4 }}
            >
              {page.description}
            </Typography>
          )}

          {isRichHtmlEmpty(contentHtml) ? (
            <Typography
              variant="body1"
              sx={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Content coming soon.
            </Typography>
          ) : (
            <Box
              className="legal-rich-text"
              sx={{ color: 'var(--color-text)' }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography
            variant="h5"
            sx={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}
          >
            Page not found
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'var(--color-text)', opacity: 0.7, mt: 1 }}
          >
            The page you are looking for does not exist.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
