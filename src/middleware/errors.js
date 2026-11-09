export function notFound(req, res) {
  res.status(404).json({ error: "not_found", message: "Route not found." });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Avoid leaking SQL, connection strings, schema details or stack traces.
  if (err?.code === "P2002") {
    return res.status(409).json({ error: "conflict", message: "A record with that value already exists." });
  }
  if (err?.code === "P2025") {
    return res.status(404).json({ error: "not_found", message: "The requested record was not found." });
  }
  if (err?.code === "P2003") {
    return res.status(400).json({ error: "invalid_reference", message: "The selected related record is invalid." });
  }

  const status = Number(err.status) || 500;
  if (status >= 500) console.error("API_ERROR", err);
  res.status(status).json({
    error: status >= 500 ? "server_error" : "request_error",
    message: status >= 500 ? "Something went wrong on the server." : err.message
  });
}
