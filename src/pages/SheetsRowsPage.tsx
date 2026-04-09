import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Trash2, Pencil, Plus, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import api from "../services/api";

type Sheet = { id: number; name: string; description?: string };
type Column = {
  id: number;
  title: string;
  data_type: string;
  order_index: number;
};
type RowItem = {
  id: number;
  note?: string | null;
  values: Record<number, any>;
  created_at: string;
  updated_at: string;
};

function formatCellValue(value: any, col?: { data_type?: string }) {
  if (value === null || value === undefined) return "-";

  // giữ nguyên nếu là object/array
  if (typeof value === "object") return JSON.stringify(value);

  // chuẩn hoá string
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return "-";

    // TH1: dạng 95.00 / 6.00 => bỏ .00
    if (/^-?\d+(\.0+)$/.test(s)) return String(parseInt(s, 10));

    // TH2: dạng số có dấu phẩy nghìn + đuôi .00: 1,234.00
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(s)) {
      const n = Number(s.replace(/,/g, ""));
      if (!Number.isNaN(n)) {
        // nếu là số nguyên thì bỏ .00
        if (Number.isInteger(n)) return String(n);
        return String(n);
      }
    }

    // còn lại giữ nguyên (vd: "18,442đ", "271,57 $")
    return s;
  }

  // number
  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    // ví dụ 12.0 => 12
    if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
    return String(value);
  }

  return String(value);
}

export function SheetsRowsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetId, setSheetId] = useState<number | null>(null);

  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<RowItem[]>([]);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openCols, setOpenCols] = useState(false);

  const [openCreateSheet, setOpenCreateSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetDesc, setNewSheetDesc] = useState("");

  const [openPerms, setOpenPerms] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserForPerm, setSelectedUserForPerm] = useState<string | null>(null);
  const [userPerms, setUserPerms] = useState<number[]>([]);
  const [syncingPerms, setSyncingPerms] = useState(false);

  const currentUser = useMemo(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);
  const isAdmin = currentUser?.role === "admin";

  // modal state
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RowItem | null>(null);
  const [note, setNote] = useState("");
  const [formValues, setFormValues] = useState<Record<number, string>>({});

  const sortOptions = useMemo(() => {
    const base = [
      { key: "updated_at", label: "Mới cập nhật" },
      { key: "created_at", label: "Mới tạo" },
      { key: "id", label: "ID" },
    ];
    const cols = columns.map((c) => ({
      key: `col:${c.id}`,
      label: `Theo cột: ${c.title}`,
    }));
    return [...base, ...cols];
  }, [columns]);

  async function loadSheets() {
    const res = await api.get("/sheets");
    // res.data = { data: [...] }
    const list = res.data?.data || [];
    setSheets(list);

    if (!sheetId && list.length) setSheetId(list[0].id);
  }

  async function loadUsers() {
    if (!isAdmin) return;
    try {
      const res = await api.get("/users?limit=100");
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Load users error:", err);
    }
  }

  async function loadUserPermissions(uid: number) {
    try {
      const res = await api.get(`/sheets/permissions/${uid}`);
      const ids = (res.data?.data || []).map((p: any) => p.sheet_id);
      setUserPerms(ids);
    } catch (err) {
      console.error("Load perms error:", err);
    }
  }

  async function syncPermissions() {
    if (!selectedUserForPerm) return;
    setSyncingPerms(true);
    try {
      await api.post("/sheets/permissions/sync", {
        userId: Number(selectedUserForPerm),
        sheetIds: userPerms,
      });
      alert("Cập nhật quyền thành công!");
    } catch (err) {
      console.error("Sync perms error:", err);
      alert("Lỗi cập nhật quyền");
    } finally {
      setSyncingPerms(false);
    }
  }

  function openPermissions() {
    setSelectedUserForPerm(null);
    setUserPerms([]);
    setOpenPerms(true);
  }

  async function loadRows(currentSheetId: number) {
    const res = await api.get(`/sheets/${currentSheetId}/rows/list`, {
      params: { q, sortBy, sortDir, page, limit },
    });

    const payload = res.data?.data; // <-- chú ý
    setColumns(payload?.columns || []);
    setRows(payload?.rows || []);
    setTotalPages(payload?.pagination?.totalPages || 1);
  }

  useEffect(() => {
    loadSheets();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sheetId) return;
    loadRows(sheetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetId, q, sortBy, sortDir, page]);

  async function createSheet() {
    if (!newSheetName.trim()) return alert("Nhập tên bảng");
    const res = await api.post("/sheets", {
      name: newSheetName.trim(),
      description: newSheetDesc?.trim() || null,
    });

    // tuỳ backend trả data kiểu nào, nhưng bạn cứ reload list cho chắc
    setOpenCreateSheet(false);
    setNewSheetName("");
    setNewSheetDesc("");
    await loadSheets();
  }

  function openCreate() {
    setEditingRow(null);
    setNote("");
    const init: Record<number, string> = {};
    for (const c of columns) init[c.id] = "";
    setFormValues(init);
    setOpen(true);
  }

  function openEdit(row: RowItem) {
    setEditingRow(row);
    setNote(row.note || "");
    const init: Record<number, string> = {};
    for (const c of columns) init[c.id] = row.values?.[c.id] ?? "";
    setFormValues(init);
    setOpen(true);
  }

  async function saveRow() {
    if (!sheetId) return;

    const toCells = (rowId: number) =>
      Object.entries(formValues).map(([colId, value]) => ({
        rowId,
        columnId: Number(colId),
        value: value ?? "",
        // nếu muốn numeric_value/meta thì thêm ở đây
        // numeric_value: ...
        // meta: ...
      }));

    if (!editingRow) {
      const createRes = await api.post(`/sheets/${sheetId}/rows`, { note });

      const rowId =
        createRes.data?.data?.id ?? createRes.data?.id; // ✅ phổ biến: { data: { id } } // fallback: { id }

      if (!rowId) {
        console.log("createRes.data =", createRes.data);
        alert("Không lấy được rowId từ API create row. Kiểm tra response!");
        return;
      }

      await api.put(`/sheets/${sheetId}/cells/bulk`, { cells: toCells(rowId) });
    } else {
      await api.put(`/sheets/${sheetId}/rows/${editingRow.id}`, { note });
      await api.put(`/sheets/${sheetId}/cells/bulk`, {
        cells: toCells(editingRow.id),
      });
    }

    setOpen(false);
    await loadRows(sheetId);
  }

  async function createColumn(payload: {
    title: string;
    data_type?: string;
    order_index?: number;
  }) {
    if (!sheetId) return;
    await api.post(`/sheets/${sheetId}/columns`, payload);
    await loadRows(sheetId); // reload columns + rows
  }

  async function updateColumn(columnId: number, payload: any) {
    if (!sheetId) return;
    await api.put(`/sheets/${sheetId}/columns/${columnId}`, payload);
    await loadRows(sheetId);
  }

  async function deleteColumn(columnId: number) {
    if (!sheetId) return;
    if (!confirm("Xóa cột này? (sẽ xóa luôn dữ liệu của cột)")) return;
    await api.delete(`/sheets/${sheetId}/columns/${columnId}`);
    await loadRows(sheetId);
  }

  async function removeRow(rowId: number) {
    if (!sheetId) return;
    if (!confirm("Xóa dòng này?")) return;
    await api.delete(`/sheets/${sheetId}/rows/${rowId}`);
    await loadRows(sheetId);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 space-y-4">
        {(!sheets || sheets.length === 0) && (
          <Card className="rounded-2xl">
            <CardBody className="p-8 text-center space-y-3">
              <div className="text-lg font-semibold">Chưa có bảng nào</div>
              <div className="opacity-70">
                {isAdmin
                  ? "Hãy tạo 1 bảng (Sheet) trước, sau đó mới thêm cột và thêm dữ liệu."
                  : "Bạn hiện chưa có quyền xem bảng nào. Vui lòng liên hệ Admin."}
              </div>
              {isAdmin && (
                <div>
                  <Button
                    color="primary"
                    onPress={() => setOpenCreateSheet(true)}
                  >
                    Tạo bảng mới
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {sheetId && (
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-xl font-semibold">Quản lý dữ liệu</div>
                <div className="text-sm opacity-70">
                  Thêm / sửa / xóa / tìm kiếm / sắp xếp
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Select
                  className="min-w-[260px]"
                  label="Chọn bảng"
                  disallowEmptySelection
                  selectedKeys={
                    sheetId ? new Set([String(sheetId)]) : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const id = Array.from(keys)[0];
                    if (id) {
                      setPage(1);
                      setSheetId(Number(id));
                    }
                  }}
                >
                  {sheets?.map((s) => (
                    <SelectItem key={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </Select>
                {isAdmin && (
                  <>
                    <Button variant="flat" onPress={() => setOpenCreateSheet(true)}>
                      Tạo bảng
                    </Button>
                    <Button variant="flat" onPress={() => setOpenCols(true)}>
                      Quản lý cột
                    </Button>
                    <Button
                      startContent={<ShieldCheck size={18} />}
                      onPress={openPermissions}
                    >
                      Cấp quyền
                    </Button>
                  </>
                )}
                <Button startContent={<Plus size={18} />} onPress={openCreate}>
                  Thêm dòng
                </Button>
              </div>
            </CardHeader>

            <CardBody className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-end">
                <Input
                  label="Tìm kiếm"
                  placeholder="Nhập từ khóa (note hoặc giá trị)..."
                  value={q}
                  onValueChange={(v) => {
                    setPage(1);
                    setQ(v);
                  }}
                />

                <div className="flex gap-2">
                  <Select
                    className="min-w-[220px]"
                    label="Sắp xếp theo"
                    disallowEmptySelection
                    selectedKeys={new Set([sortBy])}
                    onSelectionChange={(keys) => {
                      const id = Array.from(keys)[0];
                      if (id) {
                        setPage(1);
                        setSortBy(String(id));
                      }
                    }}
                  >
                    {sortOptions?.map((o) => (
                      <SelectItem key={o.key}>{o.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    className="min-w-[140px]"
                    label="Chiều"
                    disallowEmptySelection
                    selectedKeys={new Set([sortDir])}
                    onSelectionChange={(keys) => {
                      const id = Array.from(keys)[0];
                      if (id) {
                        setPage(1);
                        setSortDir(String(id) as any);
                      }
                    }}
                  >
                    <SelectItem key="desc">Giảm dần</SelectItem>
                    <SelectItem key="asc">Tăng dần</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="overflow-auto rounded-xl border border-black/10">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-black/10">
                      <th className="text-left p-3 w-[80px]">ID</th>
                      {columns?.map((c) => (
                        <th key={c.id} className="text-left p-3 min-w-[120px]">
                          {c.title}
                        </th>
                      ))}
                      <th className="text-right p-3 w-[140px]">Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows?.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-black/5 hover:bg-black/5"
                      >
                        <td className="p-3">{r.id}</td>
                        {columns?.map((c) => (
                          <td key={c.id} className="p-3">
                            {formatCellValue(r.values?.[c.id], c)}
                          </td>
                        ))}
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<Pencil size={16} />}
                              onPress={() => openEdit(r)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              startContent={<Trash2 size={16} />}
                              onPress={() => removeRow(r.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {rows?.length === 0 && (
                      <tr>
                        <td
                          className="p-6 text-center opacity-70"
                          colSpan={3 + columns.length}
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={(p) => setPage(p)}
                  showControls
                />
              </div>
            </CardBody>
          </Card>
        )}

        <Modal isOpen={open} onOpenChange={setOpen} size="3xl">
          <ModalContent>
            <ModalHeader>{editingRow ? "Sửa dòng" : "Thêm dòng"}</ModalHeader>
            <ModalBody className="space-y-3">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {columns?.map((c) => (
                  <Input
                    key={c.id}
                    label={c.title}
                    value={formValues[c.id] ?? ""}
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, [c.id]: v }))
                    }
                  />
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={saveRow}>
                Lưu
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={openCols} onOpenChange={setOpenCols} size="3xl">
          <ModalContent>
            <ModalHeader>Quản lý cột</ModalHeader>
            <ModalBody className="space-y-4">
              <AddColumnForm onAdd={createColumn} />

              <div className="overflow-auto rounded-xl border border-black/10">
                <table className="min-w-[800px] w-full text-sm">
                  <thead className="bg-white sticky top-0">
                    <tr className="border-b border-black/10">
                      <th className="text-left p-3 w-[80px]">ID</th>
                      <th className="text-left p-3">Tên cột</th>
                      <th className="text-left p-3 w-[160px]">Kiểu</th>
                      <th className="text-left p-3 w-[120px]">Thứ tự</th>
                      <th className="text-right p-3 w-[220px]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns?.map((c) => (
                      <ColumnRow
                        key={c.id}
                        col={c}
                        onSave={(payload) => updateColumn(c.id, payload)}
                        onDelete={() => deleteColumn(c.id)}
                      />
                    ))}
                    {columns?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center opacity-70">
                          Chưa có cột nào. Hãy thêm cột ở form phía trên.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setOpenCols(false)}>
                Đóng
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={openCreateSheet}
          onOpenChange={setOpenCreateSheet}
          size="lg"
        >
          <ModalContent>
            <ModalHeader>Tạo bảng mới</ModalHeader>
            <ModalBody className="space-y-3">
              <Input
                label="Tên bảng"
                value={newSheetName}
                onValueChange={setNewSheetName}
              />
              <Input
                label="Mô tả"
                value={newSheetDesc}
                onValueChange={setNewSheetDesc}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setOpenCreateSheet(false)}>
                Hủy
              </Button>
              <Button color="primary" onPress={createSheet}>
                Tạo
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Cấp Quyền */}
        <Modal
          isOpen={openPerms}
          onOpenChange={setOpenPerms}
          size="2xl"
          isDismissable={false} 
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            <ModalHeader>Quản lý quyền xem bảng (Sheet)</ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">1. Chọn User</div>
                <Select
                  label="Chọn nhân viên"
                  placeholder="Chọn một user để thiết lập quyền"
                  selectedKeys={
                    selectedUserForPerm
                      ? new Set([selectedUserForPerm])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    setSelectedUserForPerm(val);
                    if (val) loadUserPermissions(Number(val));
                    else setUserPerms([]);
                  }}
                >
                  {users.map((u) => (
                    <SelectItem key={String(u.id)} textValue={u.username}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{u.username}</span>
                        <span className="text-xs opacity-60">
                          {u.fullName || u.email || "No details"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {selectedUserForPerm && (
                <div className="space-y-2 pt-2">
                  <div className="text-sm font-semibold">
                    2. Chọn các bảng được phép xem
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-auto p-2 border rounded-xl">
                    {sheets.map((s) => {
                      const isChecked = userPerms.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/5 border-primary"
                              : "bg-white border-black/5 hover:border-black/20"
                          }`}
                          onClick={() => {
                            if (isChecked) {
                              setUserPerms((prev) =>
                                prev.filter((id) => id !== s.id),
                              );
                            } else {
                              setUserPerms((prev) => [...prev, s.id]);
                            }
                          }}
                        >
                          {isChecked ? (
                            <CheckSquare className="text-primary" size={20} />
                          ) : (
                            <Square size={20} className="opacity-30" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{s.name}</span>
                            {s.description && (
                              <span className="text-[10px] opacity-50 truncate max-w-[150px]">
                                {s.description}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] opacity-50 italic">
                    * Quyền này chỉ áp dụng cho tài khoản có role là 'user'.
                    Admin luôn xem được tất cả các bảng.
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setOpenPerms(false)}>
                Hủy
              </Button>
              <Button
                color="primary"
                isLoading={syncingPerms}
                isDisabled={!selectedUserForPerm}
                onPress={syncPermissions}
              >
                Lưu quyền hạn
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminLayout>
  );
}

function AddColumnForm({ onAdd }: { onAdd: (p: any) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [dataType, setDataType] = useState("text");
  const [orderIndex, setOrderIndex] = useState("0");

  return (
    <Card className="rounded-2xl">
      <CardBody className="space-y-3">
        <div className="text-base font-semibold">Thêm cột mới</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Tên cột"
            value={title}
            onValueChange={setTitle}
            placeholder="VD: Tổng tiền"
          />
          <Select
            label="Kiểu dữ liệu"
            selectedKeys={new Set([dataType])}
            onSelectionChange={(keys) =>
              setDataType(String(Array.from(keys)[0] || "text"))
            }
          >
            <SelectItem key="text">text</SelectItem>
            <SelectItem key="number">number</SelectItem>
            <SelectItem key="currency">currency</SelectItem>
            <SelectItem key="date">date</SelectItem>
          </Select>
          <Input
            label="Thứ tự"
            value={orderIndex}
            onValueChange={setOrderIndex}
            placeholder="0"
          />
        </div>

        <div className="flex justify-end">
          <Button
            color="primary"
            onPress={async () => {
              if (!title.trim()) return alert("Nhập tên cột");
              await onAdd({
                title: title.trim(),
                data_type: dataType,
                order_index: Number(orderIndex || 0),
              });
              setTitle("");
              setDataType("text");
              setOrderIndex("0");
            }}
          >
            Thêm cột
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function ColumnRow({
  col,
  onSave,
  onDelete,
}: {
  col: any;
  onSave: (p: any) => Promise<void>;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(col.title || "");
  const [dataType, setDataType] = useState(col.data_type || "text");
  const [orderIndex, setOrderIndex] = useState(String(col.order_index ?? 0));

  return (
    <tr className="border-b border-black/5">
      <td className="p-3">{col.id}</td>
      <td className="p-3">
        <Input size="sm" value={title} onValueChange={setTitle} />
      </td>
      <td className="p-3">
        <Select
          size="sm"
          selectedKeys={new Set([dataType])}
          onSelectionChange={(keys) =>
            setDataType(String(Array.from(keys)[0] || "text"))
          }
        >
          <SelectItem key="text">text</SelectItem>
          <SelectItem key="number">number</SelectItem>
          <SelectItem key="currency">currency</SelectItem>
          <SelectItem key="date">date</SelectItem>
        </Select>
      </td>
      <td className="p-3">
        <Input size="sm" value={orderIndex} onValueChange={setOrderIndex} />
      </td>
      <td className="p-3">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={() =>
              onSave({
                title: title.trim(),
                data_type: dataType,
                order_index: Number(orderIndex || 0),
              })
            }
          >
            Lưu
          </Button>
          <Button size="sm" color="danger" variant="flat" onPress={onDelete}>
            Xóa
          </Button>
        </div>
      </td>
    </tr>
  );
}
