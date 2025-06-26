import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Card, Button, Form, Alert, Container } from "react-bootstrap";
import api from "../api/axios";
import Comments from "../components/Comments.jsx";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../contexts/AuthContext";

function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tpl, setTpl] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api
      .get(`/templates/${id}`)
      .then(({ data }) => setTpl(data))
      .catch((err) => setError(t("Error loading template"), err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }
  if (!tpl) {
    return (
      <Alert variant="warning" className="m-4">
        {t("Template not found")}
      </Alert>
    );
  }

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        templateId: tpl.id,
        answers: tpl.questions.map((q) => ({
          questionId: q.id,
          answerText: answers[q.id] ?? "",
        })),
      };
      // Submit form answers to backend
      await api.post("/forms", payload);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Error saving answers");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("Delete this template?"))) return;
    try {
      await api.delete(`/templates/${tpl.id}`);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(t("Error deleting template"));
    }
  };

  if (submitted) {
    return (
      <Container className="mt-5">
        <Alert variant="success">
          {t("Thank you for submitting the form")}
        </Alert>
        <Button onClick={() => navigate("/")}>{t("Back to home")}</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        {tpl.imageUrl && (
          <Card.Img
            variant="top"
            src={
              tpl.imageUrl.startsWith("http")
                ? tpl.imageUrl
                : `${import.meta.env.VITE_API_URL}${tpl.imageUrl}`
            }
            style={{ maxHeight: 300, objectFit: "cover" }}
          />
        )}
        <Card.Body>
          <Card.Title>{tpl.title}</Card.Title>
          <Card.Text>{tpl.description}</Card.Text>
          <Card.Subtitle className="text-muted">
            Theme: {tpl.theme}
          </Card.Subtitle>
          {(user?.role === "ADMIN" || user?.id === tpl.authorId) && (
            <div className="mt-3">
              <Button
                size="sm"
                className="me-2"
                onClick={() => navigate(`/templates/${tpl.id}/edit`)}
              >
                {t("Edit")}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete}>
                {t("Delete")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <h4>{t("Questions")}</h4>
      <Form onSubmit={handleSubmit}>
        {tpl.questions.map((q) => (
          <Form.Group className="mb-3" controlId={`q${q.id}`} key={q.id}>
            <Form.Label>
              <strong>{q.text}</strong>
            </Form.Label>
            {q.type === "TEXT" && (
              <Form.Control
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                required
              />
            )}
            {q.type === "LONG_TEXT" && (
              <Form.Control
                as="textarea"
                rows={4}
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                required
              />
            )}
            {q.type === "NUMBER" && (
              <Form.Control
                type="number"
                min={0}
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                required
              />
            )}
            {q.type === "CHECKBOX" &&
              q.options &&
              q.options.map((opt) => (
                <Form.Check
                  type="checkbox"
                  key={opt.id}
                  label={opt.text}
                  checked={(answers[q.id] || []).includes(opt.text)}
                  onChange={(e) => {
                    const prev = answers[q.id] || [];
                    const next = e.target.checked
                      ? [...prev, opt.text]
                      : prev.filter((v) => v !== opt.text);
                    handleChange(q.id, next);
                  }}
                />
              ))}
          </Form.Group>
        ))}

        <Button variant="primary" type="submit">
          {t("Submit")}
        </Button>
      </Form>
      {user && (user.id === tpl.authorId || user.role === "ADMIN") && (
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => navigate(`/templates/${tpl.id}/analytics`)}
        >
          {t("View analytics")}
        </Button>
      )}
      <Comments templateId={tpl.id} initialLikes={tpl.likes} />
    </Container>
  );
}

export default TemplateDetail;
