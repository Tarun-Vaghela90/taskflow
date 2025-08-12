import React from 'react'
import { Popconfirm, Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
export default function PopUp({onDelete, title}) {
    const confirmDelete = () => {
    onDelete();
    message.success("Item deleted successfully!");
  };

  const cancelDelete = () => {
    message.info("Delete action cancelled");
  };
  return (
    <div>
       <Popconfirm
      title={title}
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
      okText="Yes"
      cancelText="No"
    >
      <Button danger >
        <DeleteOutlined />
      </Button>
    </Popconfirm>
    </div>
  )
}
