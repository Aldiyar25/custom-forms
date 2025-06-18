import { useContext, useState } from "react";
import {
  Navbar,
  Container,
  Form,
  Nav,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          FormsApp
        </Navbar.Brand>

        <Form
          className="d-none d-md-flex mx-auto"
          style={{ width: "40%" }}
          onSubmit={handleSearch}
        >
          <Form.Control
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>

        <Nav className="ms-auto align-items-center">
          <Dropdown className="me-3">
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              English
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>English</Dropdown.Item>
              <Dropdown.Item>Russian</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" size="sm" className="me-3">
            Switch to dark
          </Button>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Button
                  variant="outline-success"
                  size="sm"
                  className="me-3"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </Button>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                className="me-3"
                onClick={() => navigate("/profile")}
              >
                Profile
              </Button>
              <Button variant="outline-danger" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
export default Header;
