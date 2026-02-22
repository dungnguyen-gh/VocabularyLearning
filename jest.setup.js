// Jest setup file
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vocab_db_test?schema=public';
process.env.JWT_SECRET = 'test-secret-key';
