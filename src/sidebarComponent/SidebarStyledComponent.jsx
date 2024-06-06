import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const SidebarContainer = styled.div`
  width: 100%;
  max-width: 200px;
  height: 100vh;
  position: sticky;
  top: 0;
  background-color: #333;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-width: 80px;
    height: 100vh;
    overflow-y: hidden;
  }
`;

const Username = styled.span`
  color: white;
  font-size: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 20px;
  }
`;


const UserProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 20px 0;

  @media (max-width: 768px) {
    margin: 10px 0;
    width: 40px;
    height: 50px;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 10px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  margin-left: 0px;
  &:hover {
    background-color: #555;
  }

  @media (max-width: 768px) {
    align-items: center;
    span {
      display: none;
    }
  }
`;
const StyledLink = styled(Link)`
color: #fff;
text-decoration: none;
&:hover {
  text-decoration: underline;
}
`;
const Icon = styled(FontAwesomeIcon)`
  margin-right: 10px;

  @media (max-width: 768px) {
    margin-right: 0px;
    align-items: center;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  margin-top: auto;
  padding: 10px;
  background-color: #c0392b;
  border: none;
  border-radius: 0px;
  color: #fff;
  cursor: pointer;
  &:hover {
    background-color: #a93226;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

export {  SidebarContainer,
    Username,
    UserProfileImage,
    MenuContainer,
    StyledLink,
    MenuItem,
    Icon,
    LogoutButton,}
