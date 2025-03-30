import { FastifyInstance, fastify } from 'fastify'
import { httpRedisRouter } from '../../../../../src/infra/http/routers/redis.router'
import { RedisSDK } from '../../../../../src/infra/redis-sdk'

jest.mock('../../../../../src/infra/redis-sdk')

describe('Redis Router', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = fastify()
    await app.register(httpRedisRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should list messages from a topic', async () => {
    const mockMessages = [{ name: 'test' }]
    jest.spyOn(RedisSDK.prototype, 'list').mockResolvedValueOnce(mockMessages)

    const response = await app.inject({
      method: 'GET',
      url: '/topics/test-topic'
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual(mockMessages)
  })

  it('should send message to a topic', async () => {
    const sendSpy = jest.spyOn(RedisSDK.prototype, 'send').mockResolvedValueOnce()

    const response = await app.inject({
      method: 'POST',
      url: '/topics/test-topic',
      payload: {
        name: 'test message'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ status: 'ok' })
    expect(sendSpy).toHaveBeenCalledWith('test-topic', { name: 'test message' })
  })
})
