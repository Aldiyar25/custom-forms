import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Card, Button, Form, Alert, Container } from "react-bootstrap";
import api from "../api/axios";
import Comments from "../components/Comments.jsx";

function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tpl, setTpl] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get(`/templates/${id}`)
      .then(({ data }) => setTpl(data))
      .catch((err) => setError("Error loading template", err))
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
        Template not found
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
      await api.post('/forms', payload);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Error saving answers");
    }
  };

  if (submitted) {
    return (
      <Container className="mt-5">
        <Alert variant="success">Thank you for submitting the form</Alert>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        {tpl.imageUrl && (
          <Card.Img
            variant="top"
            src={tpl.imageUrl}
            style={{ maxHeight: 300, objectFit: "cover" }}
          />
        )}
        <Card.Body>
          <Card.Title>{tpl.title}</Card.Title>
          <Card.Text>{tpl.description}</Card.Text>
        </Card.Body>
      </Card>

      <h4>Questions</h4>
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
          Submit
        </Button>
      </Form>
      <Comments templateId={tpl.id} initialLikes={tpl.likes} />
    </Container>
  );
}

export default TemplateDetail;
