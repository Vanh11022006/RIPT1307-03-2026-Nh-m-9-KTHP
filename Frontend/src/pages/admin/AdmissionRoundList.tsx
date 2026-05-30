import React, { useState, useMemo, useEffect } from "react";
import { Card, Table, Input, Tag, Select, Typography, Empty, Space, Button, Modal, Form, DatePicker, InputNumber, message } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { useApplicationStore } from "../../stores/application.store";
import { formatDate } from "../../utils/date";
import type { AdmissionRoundStatus } from "../../types/admissionRound.types";

const { Text } = Typography;
const { Option } = Select;

const STATUS_LABELS: Record<AdmissionRoundStatus, string> = {
  upcoming: "Sắp diễn ra",
  active: "Đang diễn ra",
  closed: "Đã kết thúc"
};

const STATUS_COLORS: Record<AdmissionRoundStatus, string> = {
  upcoming: "blue",
  active: "green",
  closed: "default"
};

export const AdmissionRoundList: React.FC = () => {
  const { admissionRounds, loading, createAdmissionRound, updateAdmissionRound, getAdmissionRounds } = useAdmissionRoundStore();
  const { applications, loading: applicationsLoading, getApplications } = useApplicationStore();

  const [searchText, setSearchText] = useState("");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdmissionRoundStatus | "all">("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRound, setEditingRound] = useState<any>(null);
  const [form] = Form.useForm();

  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  useEffect(() => {
    getAdmissionRounds();
    getApplications();
  }, [getAdmissionRounds, getApplications]);

  const availableYears = useMemo(() => {
    const years = new Set(safeAdmissionRounds.map((ar) => ar.year).filter((y) => y !== undefined));
    return Array.from(years).sort((a, b) => b - a);
  }, [safeAdmissionRounds]);

  const filteredRounds = useMemo(() => {
    return safeAdmissionRounds.filter((round) => {
      const text = searchText.trim().toLowerCase();
      let matchSearch = true;
      if (text) {
        const code = round.code?.toLowerCase() || "";
        const name = round.name?.toLowerCase() || "";
        const desc = round.description?.toLowerCase() || "";
        matchSearch = code.includes(text) || name.includes(text) || desc.includes(text);
      }

      let matchYear = true;
      if (yearFilter !== null) {
        matchYear = round.year === yearFilter;
      }

      let matchStatus = true;
      if (statusFilter !== "all") {
        matchStatus = round.status === statusFilter;
      }

      return matchSearch && matchYear && matchStatus;
    });
  }, [safeAdmissionRounds, searchText, yearFilter, statusFilter]);

  const handleAdd = () => {
    setEditingRound(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingRound(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      year: record.year,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      status: record.status,
      description: record.description
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRound(null);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const formattedCode = values.code.trim().toUpperCase();

      const isDuplicate = safeAdmissionRounds.some((ar) =>
        ar.code?.toUpperCase() === formattedCode &&
        (!editingRound || ar.id !== editingRound.id)
      );

      if (isDuplicate) {
        form.setFields([{ name: "code", errors: ["Mã đợt xét tuyển này đã tồn tại!"] }]);
        return;
      }

      const payload = {
        code: formattedCode,
        name: values.name.trim(),
        year: values.year,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        status: values.status,
        description: values.description?.trim(),
      };

      if (editingRound) {
        updateAdmissionRound(editingRound.id, payload).then(() => {
          message.success("Cập nhật đợt xét tuyển thành công");
          return useAdmissionRoundStore.getState().getAdmissionRounds();
        });
      } else {
        createAdmissionRound(payload).then(() => {
          message.success("Thêm đợt xét tuyển thành công");
          return useAdmissionRoundStore.getState().getAdmissionRounds();
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingRound(null);
    }).catch(() => {});
  };

  const columns = [
    {
      title: "Mã đợt",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Text strong>{text || "Chưa cập nhật"}</Text>,
    },
    {
      title: "Tên đợt xét tuyển",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "Chưa cập nhật",
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      render: (year: number) => year || "Chưa cập nhật",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => date ? formatDate(date) : "Chưa cập nhật",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => date ? formatDate(date) : "Chưa cập nhật",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: AdmissionRoundStatus) => {
        if (!status) return <Text type="secondary">Chưa cập nhật</Text>;
        return <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status] || status}</Tag>;
      },
    },
    {
      title: "Số hồ sơ",
      key: "applicationCount",
      align: "center" as const,
      render: (_: any, record: any) => {
        const count = safeApplications.filter((app) => app.admissionRoundId === record.id).length;
        return <Text strong>{count}</Text>;
      }
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || <Text type="secondary">Không có mô tả</Text>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    }
  ];

  return (
    <div>
      <PageHeader title="Quản lý đợt xét tuyển" />
      <Text type="secondary" style={{ display: "block", marginBottom: 24, marginTop: -16 }}>
        Danh sách các đợt xét tuyển trong hệ thống
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm kiếm theo mã, tên hoặc mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            <Select
              placeholder="Chọn năm"
              value={yearFilter}
              onChange={(value) => setYearFilter(value)}
              style={{ width: 150 }}
              allowClear
              onClear={() => setYearFilter(null)}
            >
              <Option value={null}>Tất cả năm</Option>
              {availableYears.map((year) => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as AdmissionRoundStatus | "all")}
              style={{ width: 200 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="upcoming">Sắp diễn ra</Option>
              <Option value="active">Đang diễn ra</Option>
              <Option value="closed">Đã kết thúc</Option>
            </Select>
          </Space>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm đợt xét tuyển
          </Button>
        </div>
      </Card>

      <Card>
        {loading && safeAdmissionRounds.length === 0 ? (
          <LoadingScreen tip="Đang tải danh sách đợt xét tuyển..." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRounds}
            rowKey={(record) => record.id || Math.random().toString()}
            locale={{ emptyText: <Empty description="Không tìm thấy đợt xét tuyển phù hợp" /> }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} đợt`
            }}
            scroll={{ x: true }}
            loading={loading || applicationsLoading}
          />
        )}
      </Card>

      <Modal
        className="dark-modal"
        title={<span style={{ color: "#fff" }}>{editingRound ? "Cập nhật đợt xét tuyển" : "Thêm đợt xét tuyển"}</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingRound ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
        width={600}
        closeIcon={<CloseOutlined style={{ color: "rgba(255,255,255,0.6)" }} />}
      >
        <Form form={form} layout="vertical">
          <Space size="large" style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="code"
              label="Mã đợt"
              rules={[
                { required: true, message: "Vui lòng nhập mã đợt" },
                { whitespace: true, message: "Mã đợt không được để trống" }
              ]}
              style={{ width: "250px" }}
            >
              <Input placeholder="Ví dụ: HB2026..." />
            </Form.Item>

            <Form.Item
              name="year"
              label="Năm"
              rules={[
                { required: true, message: "Vui lòng nhập năm" },
              ]}
              style={{ width: "150px" }}
            >
              <InputNumber min={2020} max={2035} placeholder="2026" style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="name"
            label="Tên đợt xét tuyển"
            rules={[
              { required: true, message: "Vui lòng nhập tên đợt" },
              { whitespace: true, message: "Tên đợt không được để trống" }
            ]}
          >
            <Input placeholder="Ví dụ: Đợt xét tuyển học bạ đợt 1 năm 2026..." />
          </Form.Item>

          <Space size="large" style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              dependencies={['startDate']}
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('startDate')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('startDate'), 'day')) {
                      return Promise.reject(new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="upcoming">Sắp diễn ra</Option>
              <Option value="active">Đang diễn ra</Option>
              <Option value="closed">Đã kết thúc</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về đợt xét tuyển (không bắt buộc)..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};