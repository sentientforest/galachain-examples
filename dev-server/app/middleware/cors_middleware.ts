import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CorsMiddleware {
  private allowedOrigins = ['*'] // Customize this
  private allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  private allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With']
  private allowCredentials = true

  public async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const origin = request.header('origin') ?? ''

    // Check if the request origin is allowed
    if (this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin)) {
      response.header('Access-Control-Allow-Origin', this.allowedOrigins.includes('*') ? '*' : origin)
      response.header('Access-Control-Allow-Methods', this.allowedMethods.join(','))
      response.header('Access-Control-Allow-Headers', this.allowedHeaders.join(','))
      response.header('Access-Control-Allow-Credentials', this.allowCredentials.toString())
    }

    // Handle preflight (OPTIONS) request
    if (request.method() === 'OPTIONS') {
      response.status(204) // No Content
      return
    }

    await next()
  }
}