import { useState } from "react";
import {
  Navbar,
  Container,
  Form,
  Nav,
  Button,
  Dropdown,
} from "react-bootstrap";
import { List } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import { useTranslation } from "react-i18next";

function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <Navbar>
        <Container>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-3"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Menu"
          >
            <List />
          </Button>
          <Navbar.Brand
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            {t("Custom Forms")}
          </Navbar.Brand>

          <Form
            className="d-none d-md-flex mx-auto"
            style={{ width: "40%" }}
            onSubmit={handleSearch}
          >
            <Form.Control
              type="search"
              placeholder={t("Search…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Form>

          <Nav className="ms-auto align-items-center">
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                {t(i18n.language === "ru" ? "Russian" : "English")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleLangChange("en")}>
                  {t("English")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleLangChange("ru")}>
                  {t("Russian")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>
      <SideMenu show={showMenu} handleClose={() => setShowMenu(false)} />
    </>
  );
}
export default Header;
