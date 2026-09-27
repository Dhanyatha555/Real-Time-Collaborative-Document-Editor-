import { Navbar, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppNavbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          CollabDocs
        </Navbar.Brand>
        {token && user && (
          <div className="d-flex align-items-center gap-3">
            <span className="text-light">Hello, {user.name}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </Container>
    </Navbar>
  );
}
