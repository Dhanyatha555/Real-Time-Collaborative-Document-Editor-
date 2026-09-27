import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";
import { getError } from "../api.js";

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <Container style={{ maxWidth: 440 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3 text-center">Login</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100">
              Login
            </Button>
          </Form>
          <p className="mt-3 mb-0 text-center">
            New user? <Link to="/register">Register here</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
