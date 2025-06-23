import { Offcanvas, Button, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";

function SideMenu({ show, handleClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const go = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          {/* <Button
            variant="outline-primary"
            className="mb-2"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Switch to dark" : "Switch to light"}
          </Button>
          {user && user.role === "ADMIN" && (
            <Button
              variant="outline-primary"
              className="mb-2"
              onClick={() => go("/admin")}
            >
              Admin
            </Button>
          )}
          {user && (
            <>
              <Button
                variant="outline-primary"
                className="mb-2"
                onClick={() => go("/profile")}
              >
                Profile
              </Button>
              <Button
                variant="outline-danger"
                className="mb-2"
                onClick={() => {
                  logout();
                  handleClose();
                }}
              >
                Log out
              </Button>
            </>
          )} */}
          <Button
            variant="outline-primary"
            className="mb-2"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Switch to dark" : "Switch to light"}
          </Button>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-2"
                  onClick={() => go("/admin")}
                >
                  Admin
                </Button>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                className="mb-2"
                onClick={() => go("/profile")}
              >
                Profile
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  logout();
                  close();
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => go("/login")}
            >
              Log in
            </Button>
          )}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SideMenu;
