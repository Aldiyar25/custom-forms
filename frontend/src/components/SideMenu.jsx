import { Offcanvas, Button, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

function SideMenu({ show, handleClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  const go = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{t("Menu")}</Offcanvas.Title>
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
            {theme === "light" ? t("Switch to dark") : t("Switch to light")}
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
                  {t("Admin")}
                </Button>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                className="mb-2"
                onClick={() => go("/profile")}
              >
                {t("Profile")}
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  logout();
                  close();
                }}
              >
                {t("Log out")}
              </Button>
            </>
          ) : (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => go("/login")}
            >
              {t("Log in")}
            </Button>
          )}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SideMenu;
