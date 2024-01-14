import React, { useState } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const NavBar = () => {

    const [toggleState, setToggleState] = useState(false);

    const menuList = [
        {
            nav: "/overview?fetch=place",
            title: "General Overview",
        },
        {
            nav: "/overview?fetch=place",
            title: "Show by Places",
        },
        {
            nav: "/overview?fetch=device",
            title: "Show by Devices",
        },
        {
            nav: "/iot_dumps",
            title: "Fetch IOT Dumps",
        },
    ];

    const SideList = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
        // onClick={() => setToggleState(false)}
        // onKeyDown={() => setToggleState(false)}
        >
            <List>
                {menuList.map((obj, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton href={obj.nav}>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={obj.title} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
        </Box>
    );


    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" sx={{ backgroundColor: "#06E097" }}>
                    <Toolbar variant="dense">
                        <IconButton
                            edge="start"
                            color="#06E097"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setToggleState(true)}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" color="inherit" component="div">
                            Smart Light Management IOT
                        </Typography>
                    </Toolbar>

                </AppBar>
            </Box>

            <Drawer
                open={toggleState}
                onClose={() => setToggleState(false)}
            >
                <SideList />
            </Drawer>

        </>

    )
};

export default NavBar;