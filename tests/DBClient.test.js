import dbClient from '../utils/db';

describe('DBClient', () => {
  test('isAlive returns false when db is not connected', () => {
    // Ensure db is not set
    dbClient.db = null;
    expect(dbClient.isAlive()).toBe(false);
  });

  test('constructor initializes with correct default values', () => {
    expect(dbClient.host).toBe('localhost');
    expect(dbClient.port).toBe(27017);
    expect(dbClient.dbName).toBe('files_manager');
  });
});
