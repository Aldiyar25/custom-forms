import { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  InputGroup,
  FormControl,
  Button,
  Dropdown,
  Table,
  Form,
  Pagination,
  Spinner,
} from "react-bootstrap";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Admin() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  const bulkAction = async (action) => {
    // пример вызова api для групповых операций
    // await api.post(`/admin/users/bulk-${action}`, { ids: [...selected] });
    console.log("bulk", action, Array.from(selected));
  };

  const userAction = async (id, act) => {
    // act: 'block','unblock','grant','revoke','delete'
    if (act === "delete" && !window.confirm("Delete this user?")) return;
    const urlMap = {
      block: `/admin/users/${id}/block`,
      unblock: `/admin/users/${id}/unblock`,
      grant: `/admin/users/${id}/grant`,
      revoke: `/admin/users/${id}/revoke`,
    };
    if (act === "delete") {
      await api.delete(`/admin/users/${id}`);
      setUsers((us) => us.filter((u) => u.id !== id));
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      if (user.id === id) {
        logout();
        navigate("/login", { replace: true });
      }
    } else {
      await api.patch(urlMap[act]);
      setUsers((us) =>
        us.map((u) =>
          u.id === id
            ? {
                ...u,
                isBlocked: act === "block",
                role:
                  act === "grant"
                    ? "ADMIN"
                    : act === "revoke"
                    ? "USER"
                    : u.role,
              }
            : u
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid>
      <Row noGutters>
        {/* Sidebar */}
        <Col xs={2} className="border-end vh-100 bg-light">
          <Nav defaultActiveKey="/admin" className="flex-column p-3">
            <Nav.Link as={Link} to="/farms">
              🏞 Farms
            </Nav.Link>
            <Nav.Link as={Link} to="/admin">
              👤 User Management
            </Nav.Link>
            <Nav.Link as={Link} to="/settings">
              ⚙ Settings
            </Nav.Link>
          </Nav>
        </Col>

        {/* Main content */}
        <Col xs={10} className="p-4">
          <h4 className="mb-4">User Management</h4>

          {/* Search + Bulk Actions */}
          <div className="d-flex align-items-center mb-3">
            <InputGroup style={{ maxWidth: 300 }}>
              <FormControl placeholder="Search users..." />
              <Button variant="outline-secondary">Search</Button>
            </InputGroup>

            <Dropdown className="ms-2">
              <Dropdown.Toggle variant="secondary" id="bulk-actions">
                Actions ▼
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => bulkAction("block")}>
                  Block
                </Dropdown.Item>
                <Dropdown.Item onClick={() => bulkAction("grant")}>
                  Grant Admin
                </Dropdown.Item>
                <Dropdown.Item onClick={() => bulkAction("delete")}>
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Users table */}
          <Table hover responsive>
            <thead>
              <tr>
                <th>
                  <Form.Check
                    checked={selected.size === users.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Last Login</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Form.Check
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td>
                    <Link to={`/users/${u.id}`} className="fw-bold">
                      {u.username}
                    </Link>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{u.role === "ADMIN" ? "Admin" : "Analyst"}</td>
                  <td>{new Date(u.lastLogin).toLocaleString()}</td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="light" size="sm">
                        ...
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {u.isBlocked ? (
                          <Dropdown.Item
                            onClick={() => userAction(u.id, "unblock")}
                          >
                            Unblock
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            onClick={() => userAction(u.id, "block")}
                          >
                            Block
                          </Dropdown.Item>
                        )}
                        {u.role === "ADMIN" ? (
                          <Dropdown.Item
                            onClick={() => userAction(u.id, "revoke")}
                          >
                            Revoke Admin
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            onClick={() => userAction(u.id, "grant")}
                          >
                            Grant Admin
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => userAction(u.id, "delete")}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
export default Admin;
