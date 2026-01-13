import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, CalendarToday as CalendarIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { path: '/', name: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/employees', name: 'Employees', icon: <PeopleIcon /> },
        { path: '/attendance', name: 'Attendance', icon: <CalendarIcon /> },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2, fontWeight: 700, color: 'primary.main' }}>
                HRMS Lite
            </Typography>
            <List>
                {navLinks.map((link) => (
                    <ListItem
                        component={motion.li}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        selected={location.pathname === link.path}
                    >
                        <ListItemIcon sx={{ color: location.pathname === link.path ? 'primary.main' : 'inherit' }}>
                            {link.icon}
                        </ListItemIcon>
                        <ListItemText primary={link.name} sx={{ color: location.pathname === link.path ? 'primary.main' : 'inherit' }} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Container maxWidth="lg">
                <Toolbar sx={{ px: { xs: 0 } }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.light', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            HRMS Lite
                        </Typography>
                    </motion.div>

                    <Box sx={{ flexGrow: 1 }} />

                    {isMobile ? (
                        <>
                            <motion.div whileTap={{ rotate: 90 }}>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ color: 'text.primary' }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            </motion.div>
                            <Drawer
                                variant="temporary"
                                open={mobileOpen}
                                onClose={handleDrawerToggle}
                                ModalProps={{ keepMounted: true }}
                                sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: 'background.default' } }}
                            >
                                {drawer}
                            </Drawer>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.path}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        startIcon={link.icon}
                                        onClick={() => navigate(link.path)}
                                        sx={{
                                            color: location.pathname === link.path ? 'primary.light' : 'text.secondary',
                                            bgcolor: location.pathname === link.path ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)' },
                                            px: 2,
                                            borderRadius: 2
                                        }}
                                    >
                                        {link.name}
                                    </Button>
                                </motion.div>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
