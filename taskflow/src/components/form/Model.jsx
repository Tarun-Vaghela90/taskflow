import React, { Children } from "react";
import {  Modal } from "antd";
const Model = ({
  handleOk,
  confirmLoading,
  handleCancel,
  open,
  modalText,
  title,
  Children
}) => {
  return (
    <>
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
        {Children}
      </Modal>
    </>
  );
};
export default Model;
