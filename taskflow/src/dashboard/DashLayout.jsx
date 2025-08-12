import React, { useState,useEffect } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  ProfileOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme,Dropdown,Space, Avatar,Button , theme as antdTheme } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import axios from 'axios'
import { useTheme } from '../shared/hooks/ThemeContext';
import NotificationBell from '../components/notification/NotificationBell';
import { jwtDecode } from 'jwt-decode';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, path, children) {
  return {
    key,
    icon,
    label,
    children,
    path,
  };
}




const DashLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const { token } = antdTheme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const { isAdmin,logout } = useTheme();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key, keyPath }) => {
     if (key === 'edit') {
      navigate('/profile/edit');
    } else if (key === 'logout') {
      logout()
      navigate('/');
    }
    const findPath = (key, itemsList) => {
      for (const item of itemsList) {
        if (item.key === key) return item.path;
        if (item.children) {
          const childPath = findPath(key, item.children);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const path = findPath(key, items);
    if (path) navigate(path);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('Token');
        const res = await axios.get('http://localhost:3000/api/v1/users/me', {
          headers: {
            Token: token,
          },
        });
        setProfile(res.data.User);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    
    fetchProfile();
  }, []);
  
  
  const items = [
    getItem('Dashboard', '1', <PieChartOutlined />, 'dashboard'),
    getItem('Projects', '2', <DesktopOutlined />, 'projects'),
    getItem('Tasks', '3', <ProfileOutlined />, 'tasks'),
    
    // getItem('Team', 'sub2', <TeamOutlined />, null, [
      //   getItem('Team 1', '6', null, '/team/team1'),
      //   getItem('Team 2', '8', null, '/team/team2'),
    // ]),
    isAdmin ? getItem('Users', '9', <UserOutlined />, 'users'):null,
  ].filter(Boolean);;
  
  console.log("from dashlayout",isAdmin)
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit">Edit Profile</Menu.Item>
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
       
      </Sider>
      <Layout>
<Header
      style={{
        padding: '0 24px',
        background: token.colorBgContainer,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <h1 style={{ margin: 0, fontSize: '20px' }}>
        Welcome, {profile?.fullName || 'Tarun'}
      </h1>

      <Space size="large">
        <Button
          onClick={toggleTheme}
          type="default"
          size="small"
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>

        <Dropdown overlay={menu} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={
                profile?.profilePhoto
                  ? `http://localhost:3000/${profile.profilePhoto}`
                  : null
              }
              icon={!profile?.profilePhoto && <UserOutlined />}
            />
            {profile?.fullName || 'Tarun'}
            <DownOutlined />
            
          </Space>

        </Dropdown>
        <NotificationBell />
      </Space>
    </Header>


        <Content style={{ margin: '0 16px' }}>
          {/* <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} /> */}
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              margin: '16px 0'
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashLayout;
