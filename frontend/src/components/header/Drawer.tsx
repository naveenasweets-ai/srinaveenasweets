import * as React from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { RiMenuLine } from 'react-icons/ri';
import { ListItemIcon, MenuItem } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import { useStore } from '../../context/StoreContext';
import AuthApi from '../../api/auth';

export default function LeftDrawer({ visibleNavItems }: { visibleNavItems: { title: string; linkTo: string; itemIcon: React.ReactNode }[] }) {
  const { user } = useStore();
  const {logout} = AuthApi()
  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState({ left: open });
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {visibleNavItems &&
          visibleNavItems.map((text: { title: string; linkTo: string; itemIcon: React.ReactNode }, index: number) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  {text.itemIcon}
                </ListItemIcon>
                <Link to={text.linkTo} style={{ width: '100%' }}>
                  <ListItemText primary={text.title} />
                </Link>
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      {user && (
        <MenuItem onClick={() => logout()}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      )}
    </Box>
  );

  return (
    <>
      <Button onClick={toggleDrawer(true)} sx={{ px: 0, width: '100%' }}>
        <RiMenuLine className="text-white text-[1.6rem]" />
      </Button>
      <Drawer anchor="left" open={state.left} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </>
  );
}
