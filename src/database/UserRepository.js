
const DataAlreadyExist = require("../exceptions/DataAlreadyExist");
const UserNotFound = require("../exceptions/UserNotFound");


class UserRepository {
  constructor(pool) {
    this.pool = pool
  }
  async find(user) {
    const client = await this.pool.connect();
    try {
      const respDb = await client.query(`SELECT 
        id as "userId",
        url_avatar as "urlAvatar",
        username 
        FROM users us
        WHERE us.deleted_at is NULL and (us.username = $1 or us.email = $1)`, [user])
      return respDb.rows.length === 0 ? null : respDb.rows[0];
    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  };

  async getProfile(user) {
    const client = await this.pool.connect();
    try {
      const respDb = await client.query(`SELECT 
        id as "userId",
        url_avatar as "urlAvatar",
        bio,
        social_links as "socialLinks",
        username
        FROM users us
        WHERE us.deleted_at is NULL and us.username = $1`, [user])
      return respDb.rows.length === 0 ? null : respDb.rows[0];
    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  };

  async getInfo(user) {
    const client = await this.pool.connect();
    try {
      const respDb = await client.query(`SELECT 
        id as "userId",
        url_avatar as "urlAvatar",
        bio,
        social_links as "socialLinks",
        username,
        first_name as "firstName",
        last_name as "lastName",
        date_born as "dateBorn",
        email
        FROM users us
        WHERE us.deleted_at is NULL and us.username = $1`, [user])
      return respDb.rows.length === 0 ? null : respDb.rows[0];
    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  }


  async create(user) {
    const client = await this.pool.connect();
    try {
      const currentDate = new Date()
      await client.query(
        `INSERT INTO users 
        (id,
        username,
        first_name,
        last_name,
        email,
        password,
        url_avatar,
        date_born,
        created_at,
        updated_at) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [
          user.userId,
          user.username,
          user.firstNames,
          user.lastNames,
          user.email,
          user.password,
          user.urlAvatar,
          new Date(Date.now() - 599594400000),
          currentDate,
          currentDate
        ]
      );
    } catch (e) {
      throw e.code === '23505' ? new DataAlreadyExist(e.constraint.split('idx_')[1]) : e
    }
    finally {
      client.release();
    }
  };

  async delete(userId) {
    const client = await this.pool.connect();
    try {
      const currentDate = new Date()
      const respDb = await client.query(`UPDATE users SET deleted_at = $1 where id = $2`, [currentDate, userId]);
      if (respDb.rowCount === 0) {
        throw new UserNotFound(userId)
      }
    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  };

  async update(userId, data) {
    const client = await this.pool.connect()
    try {
      const keys = Object.keys(data)
      const params = []
      const values = [userId]
      for (let i = 0; i < keys.length; i++) {
        params.push(`${keys[i]} = $${values.length + 1}`)
        values.push(data[keys[i]])
      }

      const respDb = await client.query(`UPDATE users SET ${params.join(',')} WHERE id = $1 and deleted_at IS NULL`, values)
      if (respDb.rowCount <= 0) {
        throw new UserNotFound(userId)
      }

    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  }

  async findCredentials(user) {
    const client = await this.pool.connect();
    try {
      const respDb = await client.query(`
                            SELECT 
                            us.id as "userId",
                            us.url_avatar as "urlAvatar",
                            us.username,
                            us.password
                            FROM users us
                            WHERE  (us.username = $1 or us.email = $1) and deleted_at IS NULL`, [user]);

      return respDb.rows[0];
    } catch (error) {
      throw error
    } finally {
      client.release();
    }
  }
}




module.exports = UserRepository