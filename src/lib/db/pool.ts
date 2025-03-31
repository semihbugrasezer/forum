import { Pool, PoolClient } from 'pg';

// Connection pool settings optimized for high traffic
const poolConfig = {
  max: parseInt(process.env.PG_MAX_CONNECTIONS || '20', 10), // Maximum connections in pool
  min: parseInt(process.env.PG_MIN_CONNECTIONS || '5', 10),  // Minimum connections in pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Maximum number of times a single client can be used before being recycled
  // Log client creation/release for debugging
  log: process.env.NODE_ENV === 'development' ? 
    (msg: string) => console.log(`[PG POOL] ${msg}`) : 
    undefined
};

// Create singleton pool
let pool: Pool | null = null;

/**
 * Get PostgreSQL connection pool (singleton)
 * Uses environment variables:
 * - DATABASE_URL: Connection string
 * - PG_MAX_CONNECTIONS: Maximum pool size (default: 20)
 * - PG_MIN_CONNECTIONS: Minimum pool size (default: 5)
 */
export function getPool(): Pool {
  if (!pool) {
    // Create new pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ...poolConfig,
    });

    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle database client', err);
      process.exit(-1); // Exit in case of critical errors
    });

    // Log connection counts in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        console.log(`[PG POOL] Total: ${pool!.totalCount}, Idle: ${pool!.idleCount}, Waiting: ${pool!.waitingCount}`);
      }, 60000);
    }
  }
  
  return pool;
}

/**
 * Execute a query with automatic connection handling
 * Retrieves a connection from pool, executes query, and releases connection
 */
export async function query(text: string, params: any[] = []) {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 200) {
      console.log(`[PG SLOW QUERY] ${duration}ms: ${text} ${JSON.stringify(params)}`);
    }
    
    return result;
  } catch (error) {
    console.error('[PG ERROR]', error);
    throw error;
  }
}

/**
 * Execute function with a dedicated client from the pool
 * Useful for transactions or multiple related queries
 */
export async function withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction with automatic rollback on error
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  return withClient(async (client) => {
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

/**
 * Close the connection pool
 * Should be called when the application shuts down
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 