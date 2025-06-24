import { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/templates")
      .then(({ data }) => setTemplates(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner />
      </div>
    );
  }

  const renderCreateButton = () => {
    if (!user) return null;

    return (
      <div className="mb-4 text-start">
        <Button
          variant="primary"
          onClick={() => navigate("/templates/new")}
          className="mb-4"
        >
          {t("Create Template")}
        </Button>
      </div>
    );
  };

  const latest = [...templates]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const popular = [...templates]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 5);

  const tagCounts = templates
    .flatMap((t) => t.tags.map((tag) => tag.name))
    .reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

  return (
    <Container>
      {renderCreateButton()}
      <Row>
        <Col lg={8} className="pe-lg-4">
          <h3>{t("Latest Templates")}</h3>
          <Row xs={1} sm={2} className="g-4 mb-5">
            {latest.map((tpl) => (
              <Col key={tpl.id}>
                <Card
                  className="h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/templates/${tpl.id}`)}
                >
                  {tpl.imageUrl ? (
                    <Card.Img
                      variant="top"
                      src={tpl.imageUrl}
                      style={{ height: 180, objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ height: 180, background: "#f0f0f0" }} />
                  )}
                  <Card.Body>
                    <Card.Title>{tpl.title}</Card.Title>
                    <Card.Text className="text-truncate">
                      {tpl.description}
                    </Card.Text>
                    <div className="mb-2">
                      <small className="text-muted">
                        by {tpl.author.username} ·{" "}
                        {new Date(tpl.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <Badge bg="info" className="mb-2">
                      {tpl.tags[0]?.name || t("Other")}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h3>{t("Top 5 Templates")}</h3>
          <ListGroup className="mb-5">
            {popular.map((tpl, i) => (
              <ListGroup.Item
                key={tpl.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>
                  {i + 1}. {tpl.title}
                </span>
                <Badge bg="secondary">{tpl.likes?.length || 0}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col lg={4}>
          <h3>{t("Tag Cloud")}</h3>
          <div className="d-flex flex-wrap">
            {Object.entries(tagCounts).map(([tag, cnt]) => (
              <Badge
                key={tag}
                bg="light"
                text="dark"
                className="me-2 mb-2"
                style={{ fontSize: `${1 + cnt * 0.1}rem`, cursor: "pointer" }}
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(tag)}`)
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
