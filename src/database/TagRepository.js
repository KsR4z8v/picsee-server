class TagRepository {
  constructor(pool) {
    this.pool = pool
  }
  async get() {
    const client = await this.pool.connect();
    const data = await client.query(`
        SELECT t.id, t.name
        FROM tags t
        WHERE t.use >= 10
        ORDER BY use DESC
        `);
    client.release();
    return data.rows;
  };

}

module.exports = TagRepository





