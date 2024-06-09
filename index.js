const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const auth = require("json-server-auth");

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

// Custom route for querying array elements
server.get("/posts", (req, res) => {
  const db = router.db; // lowdb instance
  const category = req.query.category;

  if (category) {
    // Filter posts by category if category query param is present
    const posts = db
      .get("posts")
      .filter((post) => post.category.includes(category))
      .value();
    res.json(posts);
  } else {
    // Return all posts if no category query param
    const posts = db.get("posts").value();
    res.json(posts);
  }
});

server.db = router.db;

server.use(auth);

// Use default router
server.use(router);
// server.use("/api", router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("JSON Server is running");
});
