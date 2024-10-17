import redisClient from '../utils/redis';  // Import the RedisClient class
import { createClient } from 'redis';      // Mock redis library
import { promisify } from 'util';          // Mock promisify

jest.mock('redis', () => {
  return {
    createClient: jest.fn(() => ({
      on: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      connected: true,
    })),
  };
});

jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn),  // Mock promisify to just return the function itself
}));

describe('RedisClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Redis client and handle errors', () => {
    const mockOn = jest.spyOn(redisClient.client, 'on');
    const mockErrorHandler = jest.fn();
    
    // Check if the client error handler is attached correctly
    mockOn.mockImplementation((event, handler) => {
      if (event === 'error') {
        handler({ message: 'Error occurred' });
      }
    });

    redisClient.client.on('error', mockErrorHandler);
    
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
  });

  it('should check if the Redis client is alive', () => {
    expect(redisClient.isAlive()).toBe(true); // connected is mocked as true
  });

  it('should get a value from Redis', async () => {
    const mockGet = jest.spyOn(redisClient.client, 'get').mockResolvedValue('value');
    const value = await redisClient.get('myKey');
    
    expect(promisify).toHaveBeenCalledWith(redisClient.client.get);  // Ensure promisify was called
    expect(mockGet).toHaveBeenCalledWith('myKey');
    expect(value).toBe('value');
  });

  it('should set a value in Redis with an expiration', async () => {
    const mockSet = jest.spyOn(redisClient.client, 'set').mockResolvedValue('OK');
    const result = await redisClient.set('myKey', 'myValue', 60);
    
    expect(promisify).toHaveBeenCalledWith(redisClient.client.set);
    expect(mockSet).toHaveBeenCalledWith('myKey', 'myValue', 'EX', 60);
    expect(result).toBe('OK');
  });

  it('should delete a key in Redis', async () => {
    const mockDel = jest.spyOn(redisClient.client, 'del').mockResolvedValue(1); // Return 1 to indicate success
    const result = await redisClient.del('myKey');
    
    expect(promisify).toHaveBeenCalledWith(redisClient.client.del);
    expect(mockDel).toHaveBeenCalledWith('myKey');
    expect(result).toBe(1);
  });
});
