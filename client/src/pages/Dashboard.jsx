import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Table,
  Badge,
  Alert,
} from "react-bootstrap";
import api, { getError } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      const { data } = await api.get("/documents");
      setDocuments(data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const createDocument = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/documents", { title });
      navigate(`/documents/${data._id}`);
    } catch (err) {
      setError(getError(err));
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter((d) => d._id !== id));
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <Container>
      <h3 className="mb-3">My Documents</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={createDocument}>
            <InputGroup>
              <Form.Control
                placeholder="Enter a title for a new document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button type="submit">+ New Document</Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Owner</th>
              <th>Last Updated</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d._id}>
                <td>{d.title}</td>
                <td>
                  {d.owner._id === user._id ? (
                    <Badge bg="primary">You</Badge>
                  ) : (
                    <Badge bg="secondary">{d.owner.name}</Badge>
                  )}
                </td>
                <td>{new Date(d.updatedAt).toLocaleString()}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/documents/${d._id}`}
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                  >
                    Open
                  </Button>
                  {d.owner._id === user._id && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => deleteDocument(d._id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && documents.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  No documents yet. Create your first document above.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}
