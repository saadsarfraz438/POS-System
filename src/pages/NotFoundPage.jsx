export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <a href="/dashboard" className="btn btn-primary mt-3">Go to Dashboard</a>
    </div>
  );
}
