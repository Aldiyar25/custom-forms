import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button, Spinner } from "react-bootstrap";
import api from "../api/axios";

function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("query") || "";
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api
      .get("/templates/search", { params: { q: query } })
      .then(({ data }) => setTemplates(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Search results for "{query}"</h3>
      {templates.length === 0 && <p>No results found.</p>}
      <Row xs={1} sm={2} className="g-4">
        {templates.map((tpl) => (
          <Col key={tpl.id}>
            <Card className="h-100">
              {tpl.imageUrl ? (
                <Card.Img variant="top" src={tpl.imageUrl} style={{ height: 180, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 180, background: "#f0f0f0" }} />
              )}
              <Card.Body>
                <Card.Title>{tpl.title}</Card.Title>
                <Card.Text className="text-truncate">{tpl.description}</Card.Text>
                <div className="mb-2">
                  <small className="text-muted">
                    by {tpl.author.username} · {new Date(tpl.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <Badge bg="info" className="mb-2">
                  {tpl.tags[0]?.name || "Other"}
                </Badge>
                <div>
                  <Button size="sm" onClick={() => navigate(`/templates/${tpl.id}`)}>
                    View
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default SearchResults;
