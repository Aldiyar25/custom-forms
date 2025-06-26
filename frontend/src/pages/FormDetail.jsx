import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import api from "../api/axios";
import { useTranslation } from "react-i18next";

function FormDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/forms/${id}`)
      .then(({ data }) => setForm(data))
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setError(t("Form not found"));
        } else {
          setError(t("Error loading form"));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!form) return null;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{form.template.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {new Date(form.submittedAt).toLocaleString()}
          </Card.Subtitle>
          <ul className="mb-0">
            {form.answers.map((ans) => (
              <li key={ans.id}>
                <strong>{ans.question.text}: </strong>
                {ans.answerText}
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default FormDetail;
