import env from '#start/env';
import type { HttpContext } from '@adonisjs/core/http'

export default class ProxyController {
  public async proxy(ctx: HttpContext) {
    const { request, response } = ctx;

    const apiBase = env.get('CHAIN_API')
    const channel = request.param('channel')
    const contract = request.param('contract')
    const method = request.param('method')
    
    const url = `${apiBase}/api/${channel}/${contract}/${method}`
  
    console.log(`proxy request to: ${url}`)

    const dto = request.body()

    console.log(`proxy request dto: ${JSON.stringify(dto)}`)

    const chainRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dto)
    })

    if (!chainRes.ok) {
      console.log(`proxy request failed: ${chainRes.status}`)

      return response.status(chainRes.status ?? 500).json({
        status: chainRes.status,
        data: (await chainRes.json()),
        headers: chainRes.headers
      })
    }

    const chainResData = await chainRes.json();

    return response.status(chainRes.status).json(chainResData);
  }
}