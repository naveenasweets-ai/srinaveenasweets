import { Autocomplete, Box, InputAdornment, TextField } from '@mui/material';

import { Link } from 'react-router-dom';

import { FaSearch } from 'react-icons/fa';

const Search = () => {
  const Items: any[] = [];

  return (
    <div className="flex items-center justify-end">
      <div className="relative w-full max-w-90">
        <Autocomplete
          id="grouped-demo"
          options={[...Items].sort(
            (a, b) => -b.items_category.localeCompare(a.items_category),
          )}
          groupBy={(option: any) => option.items_category}
          getOptionLabel={(option) => option.name}
          sx={{
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              backgroundColor: '#fffdf7',
              boxShadow: '0 8px 24px rgba(139, 30, 45, 0.08)',
              paddingRight: '8px',
              minHeight: '42px',
              '& fieldset': {
                border: '1px solid #f1d7b0',
              },
              '&:hover fieldset': {
                border: '1px solid var(--color-primary-light)',
              },
              '&.Mui-focused fieldset': {
                border: '1px solid var(--color-primary)',
                boxShadow: '0 0 0 3px rgba(139, 30, 45, 0.12)',
              },
              '& input': {
                padding: '10px 12px 10px 0',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              },
            },
            '& .MuiAutocomplete-listbox': {
              padding: '6px',
              borderRadius: '14px',
              backgroundColor: '#fffdf7',
              boxShadow: '0 10px 28px rgba(77, 43, 31, 0.12)',
              border: '1px solid #f2e0be',
            },
            '& .MuiAutocomplete-option': {
              borderRadius: '10px',
              margin: '2px 0',
              padding: '10px 12px',
              color: 'var(--color-text)',
              '&:hover, &.Mui-focused': {
                backgroundColor: 'rgba(139, 30, 45, 0.08)',
              },
            },
          }}
          renderOption={(props, option) => (
            <Link
              to={`${option.items_category}/${option.item_id}`}
              key={option.item_id}
            >
              <Box
                component="li"
                sx={{
                  '& > img': { mr: 2, flexShrink: 0 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 500,
                }}
                {...props}
              >
                <span className="text-(--color-primary)">✦</span>
                <span>{option.name}</span>
              </Box>
            </Link>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              id="outlined-search"
              placeholder="Search sweets"
              variant="outlined"
              type="search"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch className="text-(--color-primary)" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Search;
