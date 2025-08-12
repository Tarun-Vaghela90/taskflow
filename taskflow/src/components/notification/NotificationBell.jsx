import React, { useEffect, useState } from "react";
import { Badge, Dropdown, List, Spin, theme, Button, message } from "antd";
import { BellOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function NotificationBell() {
  const { token } = theme.useToken();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const Token = localStorage.getItem("Token");
  const decoded = jwtDecode(Token);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/api/v1/notifications/${decoded.id}`,
        { headers: { Token: localStorage.getItem("Token") } }
      );
      const notifs = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.rows || [];
      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/notifications/${notifId}`,
        { headers: { Token: localStorage.getItem("Token") } }
      );
      message.success("Notification deleted");
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("Failed to delete notification");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notificationMenu = (
    <div
      style={{
        width: 300,
        background: token.colorBgElevated,
        borderRadius: 6,
        padding: 8,
        maxHeight: 300,
        overflowY: "auto",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Spin size="small" />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.isRead
                  ? "transparent"
                  : token.colorFillSecondary,
                borderRadius: 4,
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{item.message}</span>
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: "red" }} />}
                size="small"
                onClick={() => deleteNotification(item.id)}
              />
            </List.Item>
          )}
          locale={{ emptyText: "No notifications" }}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => {
        if (open) fetchNotifications();
      }}
    >
      <Badge count={unreadCount} size="small">
        <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
      </Badge>
    </Dropdown>
  );
}
