import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Spinner, Alert, Card, Table } from "react-bootstrap";
import api from "../api/axios";
import { useTranslation } from "react-i18next";

function TemplateAnalytics() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/templates/${id}/analytics`),
      api.get(`/templates/${id}/responses`),
    ])
      .then(([aRes, rRes]) => {
        setData(aRes.data);
        setResponses(rRes.data.forms);
      })
      .catch(() => setError(t("Error loading analytics")))
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

  if (!data) return null;

  return (
    <Container className="mt-4">
      <h3>{t("Analytics")}</h3>
      {data.analytics.map((a) => (
        <Card key={a.questionId} className="mb-3">
          <Card.Body>
            <Card.Title>{a.question}</Card.Title>
            {a.type === "NUMBER" && (
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td>{t("Count")}</td>
                    <td>{a.count}</td>
                  </tr>
                  <tr>
                    <td>{t("Average")}</td>
                    <td>{a.average !== null ? a.average.toFixed(2) : "-"}</td>
                  </tr>
                  <tr>
                    <td>{t("Min")}</td>
                    <td>{a.min !== null ? a.min : "-"}</td>
                  </tr>
                  <tr>
                    <td>{t("Max")}</td>
                    <td>{a.max !== null ? a.max : "-"}</td>
                  </tr>
                </tbody>
              </Table>
            )}
            {a.type === "CHECKBOX" && (
              <ul className="mb-0">
                {Object.entries(a.counts).map(([opt, cnt]) => (
                  <li key={opt}>{`${opt}: ${cnt}`}</li>
                ))}
              </ul>
            )}
            {(a.type === "TEXT" || a.type === "LONG_TEXT") && (
              <ul className="mb-0">
                {a.answers.map((ans, i) => (
                  <li key={i}>{ans}</li>
                ))}
              </ul>
            )}
          </Card.Body>
        </Card>
      ))}

      {responses.length > 0 && (
        <>
          <h3 className="mt-4">{t("Responses")}</h3>
          {responses.map((form) => (
            <Card key={form.id} className="mb-3">
              <Card.Body>
                <Card.Title>
                  {t("Submitted by")}: {form.user.username}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {new Date(form.submittedAt).toLocaleString()}
                </Card.Subtitle>
                <ul className="mb-0">
                  {form.answers.map((ans) => (
                    <li key={ans.id || ans.questionId}>
                      <strong>{ans.question.text}: </strong>
                      {ans.answerText}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
}

export default TemplateAnalytics;
