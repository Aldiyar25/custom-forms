import { useContext, useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [loadingTpl, setLoadingTpl] = useState(true);
  const [loadingForms, setLoadingForms] = useState(true);
  const [tplSortAsc, setTplSortAsc] = useState(false);
  const [formSortAsc, setFormSortAsc] = useState(false);

  const [showCrmForm, setShowCrmForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [titleVal, setTitleVal] = useState("");
  const [crmError, setCrmError] = useState("");
  const [crmSuccess, setCrmSuccess] = useState("");
  const [crmLoading, setCrmLoading] = useState(false);

  const [apiToken, setApiToken] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoadingTpl(true);
    api
      .get(`/users/${user.id}/templates`)
      .then(({ data }) => setTemplates(data))
      .catch(console.error)
      .finally(() => setLoadingTpl(false));

    setLoadingForms(true);
    api
      .get(`/users/${user.id}/forms`)
      .then(({ data }) => setForms(data))
      .catch(console.error)
      .finally(() => setLoadingForms(false));
  }, [user]);

  const sortedTemplates = [...templates].sort((a, b) => {
    const res = new Date(a.createdAt) - new Date(b.createdAt);
    return tplSortAsc ? res : -res;
  });

  const sortedForms = [...forms].sort((a, b) => {
    const res = new Date(a.submittedAt) - new Date(b.submittedAt);
    return formSortAsc ? res : -res;
  });

  const handleCrmSubmit = async (e) => {
    e.preventDefault();
    setCrmError("");
    setCrmSuccess("");
    setCrmLoading(true);
    try {
      await api.post(`/users/${user.id}/salesforce`, {
        companyName,
        phone,
        title: titleVal,
      });
      setCrmSuccess(t("Data sent to Salesforce"));
      setCompanyName("");
      setPhone("");
      setTitleVal("");
      setShowCrmForm(false);
    } catch (err) {
      setCrmError(err.response?.data?.message || t("Error sending data"));
    } finally {
      setCrmLoading(false);
    }
  };

  const handleGetToken = async () => {
    if (!user) return;
    setTokenError("");
    setTokenLoading(true);
    try {
      const { data } = await api.get(`/users/${user.id}/api-token`);
      setApiToken(data.apiToken);
    } catch (err) {
      setTokenError(err.response?.data?.message || "Error");
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <Container>
      {(user?.role === "ADMIN" || user) && (
        <div className="mb-4">
          <Button
            size="sm"
            onClick={() => setShowCrmForm((v) => !v)}
            className="me-2"
          >
            {t("Send to Salesforce")}
          </Button>
          {crmSuccess && (
            <Alert variant="success" className="mt-2">
              {crmSuccess}
            </Alert>
          )}
          {showCrmForm && (
            <Form onSubmit={handleCrmSubmit} className="mt-3">
              <Form.Group className="mb-2">
                <Form.Label>{t("Company Name")}</Form.Label>
                <Form.Control
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>{t("Title")}</Form.Label>
                <Form.Control
                  value={titleVal}
                  onChange={(e) => setTitleVal(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>{t("Phone")}</Form.Label>
                <Form.Control
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>
              {crmError && <Alert variant="danger">{crmError}</Alert>}
              <Button type="submit" disabled={crmLoading} size="sm">
                {crmLoading ? <Spinner size="sm" /> : t("Submit")}
              </Button>
            </Form>
          )}
        </div>
      )}

      <div className="mb-4">
        <Button size="sm" onClick={handleGetToken} className="me-2">
          {t("Get API Token")}
        </Button>
        {tokenLoading && <Spinner size="sm" />}{" "}
        {apiToken && (
          <span className="ms-2">
            {t("API Token")}: {apiToken}
          </span>
        )}
        {tokenError && (
          <Alert variant="danger" className="mt-2">
            {tokenError}
          </Alert>
        )}
      </div>

      <h3 className="mb-3">{t("My Templates")}</h3>
      {loadingTpl ? (
        <Spinner />
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>{t("Title")}</th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => setTplSortAsc((v) => !v)}
              >
                {t("Created")} {tplSortAsc ? "▲" : "▼"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTemplates.map((tpl) => (
              <tr
                key={tpl.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/templates/${tpl.id}`)}
              >
                <td>{tpl.title}</td>
                <td>{new Date(tpl.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h3 className="mt-5 mb-3">{t("My Forms")}</h3>
      {loadingForms ? (
        <Spinner />
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>{t("Template")}</th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => setFormSortAsc((v) => !v)}
              >
                {t("Submitted")} {formSortAsc ? "▲" : "▼"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedForms.map((f) => (
              <tr
                key={f.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/forms/${f.id}`)}
              >
                <td>{f.template.title}</td>
                <td>{new Date(f.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Profile;
