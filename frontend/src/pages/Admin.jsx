import { useContext, useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Form,
  ButtonGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Admin() {
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
  };

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = (id, changes) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...changes } : u))
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));
  const allSelectedBlocked =
    selectedUsers.length > 0 && selectedUsers.every((u) => u.isBlocked);
  const allSelectedAdmin =
    selectedUsers.length > 0 && selectedUsers.every((u) => u.role === "ADMIN");

  const handleToggleBlockSelected = async () => {
    const unblocking = allSelectedBlocked;
    try {
      for (const u of selectedUsers) {
        if (u.isBlocked) {
          await api.patch(`/admin/users/${u.id}/unblock`);
          updateUser(u.id, { isBlocked: false });
        } else {
          await api.patch(`/admin/users/${u.id}/block`);
          updateUser(u.id, { isBlocked: true });
        }
      }
      showToast(
        unblocking ? t("Users unblocked") : t("Users blocked"),
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(t("Action failed"), "danger");
    }
  };

  const handleToggleAdminSelected = async () => {
    const revoking = allSelectedAdmin;
    try {
      for (const u of selectedUsers) {
        if (u.role === "ADMIN") {
          await api.patch(`/admin/users/${u.id}/revoke`);
          if (user.id === u.id) {
            logout();
            navigate("/login", { replace: true });
          } else {
            updateUser(u.id, { role: "USER" });
          }
        } else {
          await api.patch(`/admin/users/${u.id}/grant`);
          updateUser(u.id, { role: "ADMIN" });
        }
      }
      showToast(
        revoking ? t("Admin rights revoked") : t("Admin rights granted"),
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(t("Action failed"), "danger");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedIds) {
        await api.delete(`/admin/users/${id}`);
      }
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      setSelectedIds([]);
      showToast(t("Users deleted"));
    } catch (err) {
      console.error(err);
      showToast(t("Action failed"), "danger");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Container>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">{t("User Management")}</h3>
          <ButtonGroup>
            <Button
              size="sm"
              variant="btn btn-outline-primary"
              onClick={handleToggleBlockSelected}
              disabled={selectedIds.length === 0}
            >
              {allSelectedBlocked ? t("Unblock") : t("Block")}
            </Button>
            <Button
              size="sm"
              variant="btn btn-outline-primary"
              onClick={handleToggleAdminSelected}
              disabled={selectedIds.length === 0}
            >
              {allSelectedAdmin ? t("Revoke") : t("Grant")}
            </Button>
            <Button
              size="sm"
              variant="btn btn-outline-primary"
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
            >
              {t("Delete")}
            </Button>
          </ButtonGroup>
        </div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  checked={
                    selectedIds.length === users.length && users.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>{t("Username")}</th>
              <th>{t("Email")}</th>
              <th>{t("Role")}</th>
              <th>{t("Joined")}</th>
              <th>{t("Blocked")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                  />
                </td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>{u.isBlocked ? t("Yes") : t("No")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Admin;
