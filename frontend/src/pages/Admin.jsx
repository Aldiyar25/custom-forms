import { useContext, useEffect, useState } from "react";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Admin() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleBlock = async (id) => {
    await api.patch(`/admin/users/${id}/block`);
    updateUser(id, { isBlocked: true });
  };

  const handleUnblock = async (id) => {
    await api.patch(`/admin/users/${id}/unblock`);
    updateUser(id, { isBlocked: false });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleGrant = async (id) => {
    await api.patch(`/admin/users/${id}/grant`);
    updateUser(id, { role: "ADMIN" });
  };

  const handleRevoke = async (id) => {
    await api.patch(`/admin/users/${id}/revoke`);
    if (user.id === id) {
      logout();
      navigate("/login", { replace: true });
    } else {
      updateUser(id, { role: "USER" });
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
    <Container>
      <h3 className="mb-3">User Management</h3>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Blocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>{u.isBlocked ? "Yes" : "No"}</td>
              <td>
                {u.isBlocked ? (
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => handleUnblock(u.id)}
                  >
                    Unblock
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => handleBlock(u.id)}
                  >
                    Block
                  </Button>
                )}
                {u.role === "ADMIN" ? (
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleRevoke(u.id)}
                  >
                    Revoke
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    className="me-2"
                    onClick={() => handleGrant(u.id)}
                  >
                    Grant
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Admin;

