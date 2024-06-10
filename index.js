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
  const page = parseInt(req.query._page, 10) || 1;
  const limit = parseInt(req.query._limit, 10) || 10;
  const sortField = req.query._sort || "id";
  const sortOrder = req.query._order === "desc" ? "desc" : "asc";

  let posts = db.get("posts");

  if (category) {
    posts = posts.filter((post) => post.category.includes(category));
  }

  // Sort posts
  posts = posts.sortBy(sortField);
  if (sortOrder === "desc") {
    posts = posts.reverse();
  }

  // Paginate posts
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = posts.slice(start, end).value();

  // Set headers for pagination
  const total = posts.size().value();
  const totalPages = Math.ceil(total / limit);
  res.setHeader("X-Total-Count", total);
  res.setHeader("X-Total-Pages", totalPages);

  res.json(paginatedPosts);
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
