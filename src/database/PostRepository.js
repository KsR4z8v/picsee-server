const UserNotFound = require("../exceptions/UserNotFound");
const PostNotFound = require("../exceptions/PostNotFound");
const { v4: uuid } = require('uuid');

class PostRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async find(postId) {
    const client = await this.pool.connect()
    try {
      const respDb = await client.query(`
        SELECT 
        p.id as "postId",
        p.url_image as "urlImage",
        p.original_file_name as "originalFileName"
        FROM posts p
        WHERE p.id = $1 and deleted_at IS NULL`, [postId])
      if (respDb.rows <= 0) {
        throw new PostNotFound(postId)
      }
      return respDb.rows[0]
    } catch (error) {
      throw error
    } finally {
      client.release()
    }
  }

  async increment(postId, value) {
    const client = await this.pool.connect()
    await client.query(`UPDATE posts SET ${value} = ${value} + 1  WHERE id = $1`, [postId])
    client.release()
  }

  async getRelevant() {
    const client = await this.pool.connect()
    const respDb = await client.query(`
      SELECT 
      url_image as image,
      json_build_object('id', us.id, 'username', us.username, 'urlAvatar', us.url_avatar) as author,
      (p.likes * 0.5 + p.views * 0.2 + p.downloads * 0.1) as score,
      p.created_at as "createdAt" 
      FROM posts p
      JOIN users us on us.id = p.user_id
      WHERE us.deleted_at IS NULL and p.deleted_at IS NULL 
      ORDER BY score DESC, p.created_at DESC
      LIMIT 5`)

    client.release()
    return respDb.rows
  }

  async get(criteria, externalId) {
    const client = await this.pool.connect();
    try {
      const params = []
      const values = []
      let i = 1
      for (const pair of criteria) {
        if (pair[0] === 'cursor') {
          params.push(`(p.created_at < $${i})`)
          values.push(new Date(Number(pair[1])))
        } else if (pair[0] === 'query') {
          params.push(`(p.description = $${i} or t.name ilike $${i} or us.username ilike $${i})`)
          values.push(`%${pair[1]}%`)
        } else if (pair[0] === 'tag') {
          params.push(`(t.name = $${i})`)
          values.push(pair[1])
        } else if (pair[0] === 'user') {
          params.push(`(us.username = $${i})`)
          values.push(pair[1])
        } else {
          continue
        }
        i += 1
      }
      const query = `
          SELECT 
          p.id as id,
          p.description,
          p.created_at as "uploadAt",
          p.likes,
          p.downloads,
          p.views,
          json_build_object('id', us.id, 'username', us.username, 'urlAvatar', us.url_avatar) as author,
          json_agg(t.name) as tags,
          p.url_image as "urlImage",
          (lk.user_id is not NUll) as liked
          FROM posts p 
          JOIN users us on p.user_id = us.id
          LEFT join posts_tags pt on pt.post_id = p.id
          LEFT join tags t on pt.tag_id = t.id
          LEFT join users_likes lk on lk.post_id = p.id ${externalId ? `and lk.user_id = '${externalId}'` : ''} and lk.state = TRUE
          WHERE p.visible = TRUE and us.state = TRUE  and us.deleted_at IS NULL ${params.length > 0 ? ` and (${params.join(' and ')}) ` : ''}
          GROUP by p.id, us.id, us.username, us.url_avatar, lk.user_id
          ORDER by p.created_at DESC 
          LIMIT 20`
      const respDb = await client.query(query, values)
      return respDb.rows;
    } catch (error) {
      console.log(error);
      throw error
    } finally {
      client.release()
    }
  };

  async like(postId, userId) {
    const client = await this.pool.connect();
    try {
      const relation = await client.query(
        `SELECT id FROM users_likes  where post_id = $1 and user_id = $2`, [postId, userId]);
      if (relation.rows.length > 0) {
        await client.query(
          `UPDATE users_likes SET state = not state where post_id = $1 and user_id = $2`, [postId, userId])
      } else {
        await client.query(
          `INSERT INTO users_likes (post_id, user_id)  values($1, $2); `, [postId, userId])
      }
    }
    catch (error) {
      if (error.code === '23503') {
        if (error.constraint === 'fk_post_id') {
          throw new PostNotFound(postId)
        }
        if (error.constraint === 'fk_user_id') {
          throw new UserNotFound(userId)
        }
      }
      throw error
    } finally {
      client.release();
    }
  };

  async create(userId, photos, tags = [], uploadFilePromise) {
    const client = await this.pool.connect();
    try {
      const currentDate = new Date().toISOString()
      const postToInserted = []
      const tagsToInserted = []
      const relationTagInserted = []
      const tagsFlat = tags.flat(1).map(t => t.toLowerCase())
      let allTagsFound = []
      if (tagsFlat.length > 0) {
        const placeholder = new Array(tagsFlat.length).fill('$').map((e, i) => `${e}${i + 1} `)
        allTagsFound = (await client.query(`SELECT id, name FROM tags WHERE name in (${placeholder.join(',')})`, tagsFlat)).rows
      }
      for (let i = 0; i < photos.length; i++) {
        const urlImage = photos[i].url
        const originalName = photos[i].originalname
        const postId = uuid()
        postToInserted.push(`('${postId}', '${userId}', '','${urlImage}','${originalName}' ,'${currentDate}','${currentDate}')`)
        const size = tags[i] ? tags[i].length : 0
        for (let j = 0; j < size; j++) {
          const tag = tags[i][j].toLowerCase()
          const tagFound = allTagsFound.find(t => t.name === tag)
          if (tagFound) {// si se encuentra solo inserto la relacion
            relationTagInserted.push(`('${postId}', '${tagFound.id}')`)
            continue
          }
          const tagId = uuid()
          tagsToInserted.push(`('${tagId}', '${tag}')`)
          relationTagInserted.push(`('${postId}', '${tagId}')`)
        }
      }
      await client.query('BEGIN;')
      if (tagsToInserted.length > 0) {
        await client.query(`INSERT INTO tags
        (id, name) 
              VALUES ${tagsToInserted.join(',')} ON CONFLICT DO NOTHING`)
      }
      await Promise.all([
        uploadFilePromise,
        client.query(`INSERT INTO posts
      (id, user_id, description, url_image, original_file_name, created_at, updated_at) 
            VALUES ${postToInserted.join(',')} `),

        relationTagInserted.length > 0 ? client.query(`INSERT INTO posts_tags
      (post_id, tag_id) 
              VALUES ${relationTagInserted.join(',')} `) : undefined,
      ])
      await client.query('COMMIT;')

    } catch (error) {
      await client.query('ROLLBACK;')
      throw error
    } finally {
      client.release();
    }
  };

}

module.exports = PostRepository