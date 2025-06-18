import { useContext, useEffect, useState } from "react";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
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

  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting template", err);
    }
  };

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
      <h3 className="mb-3">My Templates</h3>
      {loadingTpl ? (
        <Spinner />
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Title</th>
              <th style={{ cursor: "pointer" }} onClick={() => setTplSortAsc((v) => !v)}>
                Created {tplSortAsc ? "▲" : "▼"}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTemplates.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" className="me-2" onClick={() => navigate(`/templates/${t.id}/edit`)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deleteTemplate(t.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h3 className="mt-5 mb-3">My Forms</h3>
      {loadingForms ? (
        <Spinner />
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Template</th>
              <th style={{ cursor: "pointer" }} onClick={() => setFormSortAsc((v) => !v)}>
                Submitted {formSortAsc ? "▲" : "▼"}
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
