import React, { useState, useMemo } from "react";
import { Card, Table, Input, Tag, Space, Typography, Empty, Button, Modal, Form, Select, message, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { useSubjectGroupStore } from "../../stores/subjectGroup.store";
import { useMajorStore } from "../../stores/major.store";

const { Text } = Typography;

const SUBJECT_NAMES: Record<string, string> = {
  math: "Toán",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
  civicEducation: "Giáo dục công dân"
};

export const SubjectGroupList: React.FC = () => {
  const { subjectGroups, createSubjectGroup, updateSubjectGroup } = useSubjectGroupStore();
  const { majors } = useMajorStore();
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [form] = Form.useForm();

  const safeSubjectGroups = Array.isArray(subjectGroups) ? subjectGroups : [];
  const safeMajors = Array.isArray(majors) ? majors : [];

  const getUsageInfo = (code: string) => {
    if (!code) return { count: 0, names: [] };
    const usingMajors = safeMajors.filter(major => {
      const codes = Array.isArray(major.subjectGroupCodes) ? major.subjectGroupCodes : [];
      return codes.includes(code);
    });
    return {
      count: usingMajors.length,
      names: usingMajors.map(m => m.name)
    };
  };

  const filteredGroups = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return safeSubjectGroups;

    return safeSubjectGroups.filter((group) => {
      const matchCode = group.code?.toLowerCase().includes(text);
      const matchName = group.name?.toLowerCase().includes(text);
      
      const safeSubjects = Array.isArray(group.subjects) ? group.subjects : [];
      const matchSubject = safeSubjects.some(sub => {
        const viName = SUBJECT_NAMES[sub] || sub;
        return viName.toLowerCase().includes(text);
      });

      return matchCode || matchName || matchSubject;
    });
  }, [searchText, safeSubjectGroups]);

  const handleAdd = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingGroup(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      subjects: record.subjects
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingGroup(null);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const formattedCode = values.code.trim().toUpperCase();
      
      const isDuplicate = safeSubjectGroups.some(sg => 
        sg.code === formattedCode && 
        (!editingGroup || sg.code !== editingGroup.code)
      );

      if (isDuplicate) {
        form.setFields([{ name: 'code', errors: ['Mã tổ hợp này đã tồn tại!'] }]);
        return;
      }

      const payload = {
        code: formattedCode,
        name: values.name.trim(),
        subjects: values.subjects,
      };

      if (editingGroup) {
        updateSubjectGroup(editingGroup.id ?? editingGroup.code, payload)
          .then(() => useSubjectGroupStore.getState().getAllSubjectGroups())
          .then(() => message.success("Cập nhật tổ hợp xét tuyển thành công"));
      } else {
        createSubjectGroup(payload)
          .then(() => useSubjectGroupStore.getState().getAllSubjectGroups())
          .then(() => message.success("Thêm tổ hợp xét tuyển thành công"));
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingGroup(null);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const columns = [
    {
      title: "Mã tổ hợp",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Text strong>{text || "Chưa cập nhật"}</Text>,
    },
    {
      title: "Tên tổ hợp",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "Chưa cập nhật",
    },
    {
      title: "Môn xét tuyển",
      dataIndex: "subjects",
      key: "subjects",
      render: (subjects: string[]) => {
        const safeSubjects = Array.isArray(subjects) ? subjects : [];
        if (safeSubjects.length === 0) return <Text type="secondary">Chưa cập nhật</Text>;
        
        return (
          <Space size={[0, 8]} wrap>
            {safeSubjects.map(sub => (
              <Tag color="blue" key={sub}>
                {SUBJECT_NAMES[sub] || sub}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Số ngành sử dụng",
      key: "usage",
      render: (_: any, record: any) => {
        const info = getUsageInfo(record.code);
        if (info.count === 0) {
          return <Text type="secondary">0</Text>;
        }
        return (
          <Tooltip title={info.names.join(", ")}>
            <Tag color="green" style={{ cursor: "pointer" }}>{info.count} ngành</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)}
        >
          Sửa
        </Button>
      ),
    }
  ];

  return (
    <div>
      <PageHeader title="Quản lý tổ hợp xét tuyển" />
      <Text type="secondary" style={{ display: 'block', marginBottom: 24, marginTop: -16 }}>
        Danh sách các tổ hợp môn được sử dụng trong xét tuyển
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã tổ hợp, tên tổ hợp hoặc môn học..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
            style={{ maxWidth: 600, flex: 1 }}
          />
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm tổ hợp
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredGroups}
          rowKey={(record) => record.code || Math.random().toString()}
          locale={{
            emptyText: <Empty description="Không tìm thấy tổ hợp xét tuyển phù hợp" />
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} tổ hợp`
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        className="dark-modal"
        title={<span style={{ color: "#fff" }}>{editingGroup ? "Cập nhật tổ hợp xét tuyển" : "Thêm tổ hợp xét tuyển"}</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingGroup ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose

        closeIcon={<CloseOutlined style={{ color: "rgba(255,255,255,0.6)" }} />}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Mã tổ hợp"
            rules={[
              { required: true, message: "Vui lòng nhập mã tổ hợp" },
              { whitespace: true, message: "Mã tổ hợp không được để trống" }
            ]}
            extra={
              editingGroup && getUsageInfo(editingGroup.code).count > 0 
              ? "Mã tổ hợp đang được sử dụng bởi ngành học nên không thể chỉnh sửa." 
              : ""
            }
          >
            <Input 
              placeholder="Ví dụ: A00, D01..." 
              disabled={editingGroup && getUsageInfo(editingGroup.code).count > 0}
            />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="Tên tổ hợp"
            rules={[
              { required: true, message: "Vui lòng nhập tên tổ hợp" },
              { whitespace: true, message: "Tên tổ hợp không được để trống" }
            ]}
          >
            <Input placeholder="Ví dụ: Toán, Vật lý, Hóa học..." />
          </Form.Item>
          
          <Form.Item
            name="subjects"
            label="Môn xét tuyển"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 môn" },
              { type: 'array', min: 1, message: "Vui lòng chọn ít nhất 1 môn" }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các môn học"
              allowClear
              options={Object.entries(SUBJECT_NAMES).map(([value, label]) => ({ label, value }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
