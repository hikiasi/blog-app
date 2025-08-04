import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'blog_schema',
  password: process.env.DB_PASSWORD || 'ПАРОЛЬ',
  port: process.env.DB_PORT || 5432,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({ 
      user: { id: user.id, username: user.username },
      token 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({ 
      user: { id: user.id, username: user.username },
      token 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const { tag, author, feed } = req.query;
    let query = `
      SELECT 
        p.id, p.title, p.content, p.is_public, p.is_request_only, 
        p.created_at, p.updated_at,
        u.id as author_id, u.username as author_name,
        COUNT(c.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
    `;
    
    const params = [];
    let whereConditions = [];
    
    if (tag) {
      query += `
        JOIN post_tags pt ON p.id = pt.post_id
        JOIN tags t ON pt.tag_id = t.id
      `;
      whereConditions.push(`t.name = $${params.length + 1}`);
      params.push(tag);
    }
    
    if (author) {
      whereConditions.push(`u.username = $${params.length + 1}`);
      params.push(author);
    }
    
    if (feed === 'following') {
      // For following feed, we need to check if user is authenticated
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          query += `
            JOIN subscriptions s ON p.user_id = s.followed_id
          `;
          whereConditions.push(`s.follower_id = $${params.length + 1}`);
          params.push(decoded.id);
        } catch (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } else {
        return res.status(401).json({ error: 'Authentication required for following feed' });
      }
    }
    
    // Add visibility filter - only show public posts or posts by the current user
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let currentUserId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        // Token is invalid, treat as anonymous user
      }
    }
    
    if (currentUserId) {
      // Show public posts, request-only posts, and user's own posts
      whereConditions.push(`(p.is_public = true OR p.user_id = $${params.length + 1})`);
      params.push(currentUserId);
    } else {
      // Show only public posts for anonymous users
      whereConditions.push(`p.is_public = true`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY p.id, u.id ORDER BY p.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    // Get tags and comments for each post
    const posts = await Promise.all(result.rows.map(async (post) => {
      const tagsResult = await pool.query(
        'SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = $1',
        [post.id]
      );
      
      const commentsResult = await pool.query(
        `SELECT c.id, c.content, c.created_at, u.id as author_id, u.username as author_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [post.id]
      );
      
      return {
        ...post,
        tags: tagsResult.rows.map(row => row.name),
        comments: commentsResult.rows.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          author: {
            id: comment.author_id,
            name: comment.author_name
          }
        })),
        author: {
          id: post.author_id,
          name: post.author_name
        }
      };
    }));
    
    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, visibility } = req.body;
    const userId = req.user.id;
    
    // Create post
    const postResult = await pool.query(
      `INSERT INTO posts (user_id, title, content, is_public, is_request_only) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        userId, 
        title, 
        content, 
        visibility === 'public', 
        visibility === 'request_only'
      ]
    );
    
    const post = postResult.rows[0];
    
    // Add tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create tag if it doesn't exist
        let tagResult = await pool.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        let tagId;
        if (tagResult.rows.length === 0) {
          const newTagResult = await pool.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [tagName]
          );
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Link tag to post
        await pool.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [post.id, tagId]
        );
      }
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, visibility } = req.body;
    const userId = req.user.id;
    
    // Check if user owns the post
    const postCheck = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }
    
    // Update post
    await pool.query(
      `UPDATE posts SET title = $1, content = $2, is_public = $3, is_request_only = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [title, content, visibility === 'public', visibility === 'request_only', id]
    );
    
    // Update tags
    await pool.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
    
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tagResult = await pool.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        let tagId;
        if (tagResult.rows.length === 0) {
          const newTagResult = await pool.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [tagName]
          );
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        await pool.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [id, tagId]
        );
      }
    }
    
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Comments routes
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, content]
    );
    
    const comment = result.rows[0];
    
    // Get author info
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: userId,
          name: userResult.rows[0].username
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow routes
app.post('/api/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    
    if (followerId === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    await pool.query(
      'INSERT INTO subscriptions (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, userId]
    );
    
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    
    await pool.query(
      'DELETE FROM subscriptions WHERE follower_id = $1 AND followed_id = $2',
      [followerId, userId]
    );
    
    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/follow/:userId/status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE follower_id = $1 AND followed_id = $2',
      [followerId, userId]
    );
    
    res.json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user stats (following and followers count)
app.get('/api/follow/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get following count (how many users this user follows)
    const followingResult = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE follower_id = $1',
      [userId]
    );

    // Get followers count (how many users follow this user)
    const followersResult = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE followed_id = $1',
      [userId]
    );

    res.json({
      following: parseInt(followingResult.rows[0].count),
      followers: parseInt(followersResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tags routes
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.name, COUNT(pt.post_id) as count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id, t.name
      ORDER BY count DESC
    `);
    
    res.json({ tags: result.rows });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 