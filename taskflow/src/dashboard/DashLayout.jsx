import React, { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  PieChartOutlined,
  ProfileOutlined,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar, Button, Modal, theme as antdTheme } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../shared/hooks/ThemeContext';
import NotificationBell from '../components/notification/NotificationBell';
import EditProfile from '../user/EditProfile';

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
  const { isDark, toggleTheme, setIsAdmin, isAdmin, logout,setUserId } = useTheme();
  const { token } = antdTheme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(); // e.g. 'editProfile'

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('Token');
      const res = await axios.get('http://localhost:3000/api/v1/users/me', {
        headers: { Token: token },
      });
      setProfile(res.data.User);
      setIsAdmin(res.data.User.isAdmin);
      setUserId(res.data.User.id)
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const items = [
    getItem('Dashboard', '1', <PieChartOutlined />, 'dashboard'),
    getItem('Projects', '2', <DesktopOutlined />, 'projects'),
    getItem('Tasks', '3', <ProfileOutlined />, 'tasks'),
    isAdmin ? getItem('Users', '9', <UserOutlined />, 'users') : null,
  ].filter(Boolean);

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      setModalType('editProfile');
      setIsModalVisible(true);
    } else if (key === 'logout') {
      logout();
      navigate('/');
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit">Edit Profile</Menu.Item>
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={({ key }) => navigate(items.find(i => i.key === key)?.path || '/')}
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
            <Button onClick={toggleTheme} type="default" size="small">
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
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
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

      {/* Modal */}
      <Modal
  title={modalType === 'editProfile' ? 'Edit Profile' : ''}
  open={isModalVisible} // ✅ use `open` instead of `visible` in AntD v5
  onCancel={() => setIsModalVisible(false)}
  footer={null}
>
  {modalType === 'editProfile' && (
    <EditProfile
      onClose={() => setIsModalVisible(false)}
      onSuccess={() => {
        fetchProfile(); // ✅ refresh profile data after save
        setIsModalVisible(false);
      }}
    />
  )}
</Modal>

    </Layout>
  );
};

export default DashLayout;
