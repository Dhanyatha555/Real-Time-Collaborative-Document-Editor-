import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Form, Button, Badge, Alert, InputGroup } from "react-bootstrap";
import api, { getError } from "../api.js";
import { createSocket } from "../socket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Editor() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [joined, setJoined] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const socketRef = useRef(null);
  const saveTimer = useRef(null);
  const pendingSave = useRef(null);

  // Step 1: load the saved document through the REST API
  useEffect(() => {
    setLoaded(false);
    setError("");
    api
      .get(`/documents/${id}`)
      .then(({ data }) => {
        setTitle(data.title);
        setContent(data.content);
        setIsOwner(data.isOwner);
        setCollaborators(data.collaborators);
        setStatus("All changes saved");
        setLoaded(true);
      })
      .catch((err) => setError(getError(err)));
  }, [id]);

  // Step 2: open the Socket.IO connection and join this document's room
  useEffect(() => {
    if (!loaded) return;
    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join-document", id));
    socket.on("joined", () => setJoined(true));
    socket.on("disconnect", () => setJoined(false));
    socket.on("active-users", (users) => setActiveUsers(users));
    socket.on("document-saved", () => setStatus("All changes saved"));
    socket.on("error-message", (message) => setError(message));
    socket.on("connect_error", (err) => setError(`Connection error: ${err.message}`));

    // changes made by another user arrive here
    socket.on("receive-changes", (data) => {
      setTitle(data.title);
      setContent(data.content);
      clearTimeout(saveTimer.current); // the sender saves this version
      pendingSave.current = null;
    });

    return () => {
      // save any unsaved change before leaving the page
      if (pendingSave.current) socket.emit("save-document", pendingSave.current);
      clearTimeout(saveTimer.current);
      socket.disconnect();
    };
  }, [loaded, id, token]);

  // called whenever this user edits the title or the text
  const handleChange = (newTitle, newContent) => {
    setTitle(newTitle);
    setContent(newContent);

    const payload = { documentId: id, title: newTitle, content: newContent };
    socketRef.current.emit("send-changes", payload); // live update to others

    setStatus("Saving...");
    pendingSave.current = payload;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      socketRef.current.emit("save-document", payload); // auto-save after 1 s
      pendingSave.current = null;
    }, 1000);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareMessage("");
    try {
      const { data } = await api.post(`/documents/${id}/share`, {
        email: shareEmail,
      });
      setCollaborators(data.collaborators);
      setShareEmail("");
      setShareMessage("Document shared successfully");
    } catch (err) {
      setShareMessage(getError(err));
    }
  };

  if (!loaded) {
    return (
      <Container>
        {error ? <Alert variant="danger">{error}</Alert> : <p>Loading...</p>}
        <Link to="/">Back to My Documents</Link>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Link to="/">&larr; Back to My Documents</Link>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={joined ? "success" : "warning"}>
            {joined ? "Live" : "Connecting..."}
          </Badge>
          <span className="text-muted">{status}</span>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form.Control
        className="title-input mb-2"
        value={title}
        placeholder="Document title"
        disabled={!joined}
        onChange={(e) => handleChange(e.target.value, content)}
      />

      <div className="mb-2">
        <span className="me-2">Online now:</span>
        {activeUsers.map((u) => (
          <Badge bg="info" text="dark" className="me-1" key={u.id}>
            {u.name}
            {u.id === user._id ? " (you)" : ""}
          </Badge>
        ))}
      </div>

      <Form.Control
        as="textarea"
        className="editor-area shadow-sm"
        value={content}
        placeholder="Start typing here. Everyone with access sees the changes live."
        disabled={!joined}
        onChange={(e) => handleChange(title, e.target.value)}
      />

      <div className="mt-3 mb-5">
        <strong>Collaborators: </strong>
        {collaborators.length === 0 && <span className="text-muted">None yet</span>}
        {collaborators.map((c) => (
          <Badge bg="secondary" className="me-1" key={c._id}>
            {c.name}
          </Badge>
        ))}
        {isOwner && (
          <Form onSubmit={handleShare} className="mt-2" style={{ maxWidth: 480 }}>
            <InputGroup>
              <Form.Control
                type="email"
                placeholder="Enter your friend's registered email to share"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="outline-primary">
                Share
              </Button>
            </InputGroup>
            {shareMessage && <small className="text-muted">{shareMessage}</small>}
          </Form>
        )}
      </div>
    </Container>
  );
}
