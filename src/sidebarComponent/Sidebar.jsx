import {
  SidebarContainer,
  Username,
  UserProfileImage,
  MenuContainer,
  MenuItem,
  Icon,
  LogoutButton,
  StyledLink,
} from "./SidebarStyledComponent";
import PropTypes from "prop-types";
import {
  faHome,
  faFutbol,
  faUsers,
  faBuilding,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import userImage from "../assets/image.jpeg";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/Firebase.jsx';
import React, { useState, useEffect } from 'react';
import { getUser } from '../firebase/firebaseFunctions'; 

// Extract menu items to an array for better scalability
const menuItems = [
  { icon: faHome, text: "Home", id: "dashboard" },
  { icon: faFutbol, text: "Add a Match", id: "createMatch" },
  { icon: faUsers, text: "Players", id: "players" },
  { icon: faBuilding, text: "Clubs", id: "club" },
  { icon: faUser, text: "Profile", id: "profile" },
];


const Sidebar = ({ userProfileImage }) => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState('');
  
  const fetchUserName = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userData = await getUser(currentUser.uid);
        const username = userData.name;

        setUserName(username);
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  fetchUserName();

  useEffect(() => {
    const pathname = location.pathname;
    setActiveMenuItem(pathname.split('/')[1]);
  }, [location]);


  const handleMenuItemClick = (id) => {
    navigate(`/${id}`);
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SidebarContainer>
      <Link to="/profile">
        <UserProfileImage src={userImage} alt="User Profile" />
      </Link>
      <Username>{userName}</Username>
      <MenuContainer>
        {menuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleMenuItemClick(item.id)}
          style={{
            backgroundColor:
              activeMenuItem === item.id ? '#555' : 'transparent',
          }}>
            <Icon icon={item.icon} />
            <span>{item.text}</span> 
          </MenuItem>
        ))}
      </MenuContainer>
      <LogoutButton onClick={handleLogout}>
        <Icon icon={faSignOutAlt} />
        <span>Logout</span>
      </LogoutButton>
    </SidebarContainer>
  );
};

Sidebar.propTypes = {
  userProfileImage: PropTypes.string,
};

export default Sidebar;