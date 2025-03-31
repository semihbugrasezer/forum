const express = require("express");
const next = require("next");
const compression = require("compression");
const { parse } = require("url");
const { join } = require("path");
// Database connection pool (it will be imported dynamically in the code)
let dbPool;

// Environment setup
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Memory store for rate limiting
const rateLimits = new Map();

// Configuration
const config = {
  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute per IP
    message: JSON.stringify({
      error: "Too many requests, please try again later",
    }),
  },
  // Compression
  compression: {
    level: 6, // 0-9, higher = more compression but more CPU
    threshold: 1024, // Only compress responses that are at least 1KB
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers["x-no-compression"]) return false;
      // Compress everything else
      return compression.filter(req, res);
    },
  },
  // Caching headers
  cache: {
    staticMaxAge: 31536000, // 1 year for static assets
    assetsMaxAge: 2592000, // 30 days for _next/static assets
    fontMaxAge: 604800, // 7 days for fonts
    defaultMaxAge: 0, // No cache for dynamic content
  },
};

// Simple rate limiter middleware
function rateLimiter(req, res, next) {
  // Skip rate limiting for static assets
  if (req.url.startsWith("/_next/static") || req.url.startsWith("/static")) {
    return next();
  }

  // Get client IP
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;

  // Clean up old entries
  if (now % 60000 < 1000) {
    // Once per minute approximately
    for (const [key, value] of rateLimits.entries()) {
      if (value.timestamp < windowStart) {
        rateLimits.delete(key);
      }
    }
  }

  // Get/create rate limit entry
  let rateLimit = rateLimits.get(ip);

  if (!rateLimit) {
    rateLimit = { count: 0, timestamp: now };
    rateLimits.set(ip, rateLimit);
  } else if (rateLimit.timestamp < windowStart) {
    rateLimit.count = 0;
    rateLimit.timestamp = now;
  }

  // Increment count
  rateLimit.count++;

  // Check if over limit
  if (rateLimit.count > config.rateLimit.max) {
    res.status(429).send(config.rateLimit.message);
    return;
  }

  // Add rate limit headers
  res.setHeader("X-RateLimit-Limit", config.rateLimit.max);
  res.setHeader(
    "X-RateLimit-Remaining",
    Math.max(0, config.rateLimit.max - rateLimit.count)
  );

  next();
}

// Function to add cache headers based on content type
function addCacheHeaders(req, res, next) {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // Set cache headers based on the type of file
  if (pathname.startsWith("/_next/static")) {
    // Next.js static files
    res.setHeader(
      "Cache-Control",
      `public, max-age=${config.cache.assetsMaxAge}, immutable`
    );
  } else if (
    pathname.startsWith("/static") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  ) {
    // Static files, JS and CSS
    res.setHeader(
      "Cache-Control",
      `public, max-age=${config.cache.staticMaxAge}, immutable`
    );
  } else if (
    pathname.includes("/fonts/") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".ttf")
  ) {
    // Fonts
    res.setHeader(
      "Cache-Control",
      `public, max-age=${config.cache.fontMaxAge}`
    );
  } else if (pathname.includes("/api/")) {
    // API routes - no cache by default but can be overridden in the API route
    res.setHeader("Cache-Control", "no-store, max-age=0");
  } else if (pathname.includes("/optimized/")) {
    // Optimized images
    res.setHeader(
      "Cache-Control",
      `public, max-age=${config.cache.staticMaxAge}, immutable`
    );
  }

  next();
}

// Initialize the server
app
  .prepare()
  .then(async () => {
    const server = express();

    // Initialize database pool
    try {
      // Dynamically import to avoid issues with ESM/CJS compatibility
      const { getPool } = await import("./src/lib/db/pool.js");
      dbPool = getPool();
      console.log("> Database connection pool initialized");
    } catch (error) {
      console.error("> Failed to initialize database pool:", error);
      // Continue without DB pool if it fails (might be using Supabase only)
    }

    // Add security headers
    server.use((req, res, next) => {
      // Security headers
      res.setHeader("X-DNS-Prefetch-Control", "on");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      );

      if (process.env.NODE_ENV === "production") {
        res.setHeader(
          "Strict-Transport-Security",
          "max-age=63072000; includeSubDomains; preload"
        );
      }

      next();
    });

    // Enable compression for all responses
    server.use(compression(config.compression));

    // Add rate limiting
    server.use(rateLimiter);

    // Add cache headers
    server.use(addCacheHeaders);

    // Serve static files with improved caching
    server.use(
      "/static",
      express.static(join(__dirname, "public"), {
        maxAge: config.cache.staticMaxAge * 1000, // Convert to milliseconds
      })
    );

    // Handle all requests with Next.js
    server.all("*", (req, res) => {
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    });

    // Start the server
    const serverInstance = server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
      console.log(`> Using custom server with compression and rate limiting`);
      console.log(`> Max requests per minute per IP: ${config.rateLimit.max}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log("Shutting down gracefully...");

      // Close HTTP server
      serverInstance.close(async () => {
        // Close database pool if it exists
        if (dbPool) {
          try {
            const { closePool } = await import("./src/lib/db/pool.js");
            await closePool();
            console.log("Database connections closed");
          } catch (err) {
            console.error("Error closing database connections:", err);
          }
        }

        console.log("HTTP server closed");
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
