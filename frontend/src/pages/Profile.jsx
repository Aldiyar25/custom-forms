import { useContext, useEffect, useState } from "react";
import { Container, Table, Spinner } from "react-bootstrap";
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

  return (
    <Container>
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
              <tr key={f.id}>
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
