interface AiConfig {
  provider: string
  apiKey: string
  apiUrl: string
  model: string
  isConfigured: boolean
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}



export class AiService {
  private config: AiConfig

  constructor(config: AiConfig) {
    this.config = config
  }

  async sendMessage(messages: Message[]): Promise<string> {
    if (!this.config.isConfigured) {
      throw new Error('AI 服务未配置')
    }

    if (this.config.provider !== 'custom') {
      throw new Error('仅支持自定义 AI 服务商')
    }

    return this.callCustomAPI(messages)
  }


  private async callCustomAPI(messages: Message[]): Promise<string> {
    if (!this.config.apiUrl) {
      throw new Error('自定义 API 需要配置 API URL')
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`自定义 API 错误: ${response.status} - ${errorData}`)
    }

    const data = await response.json()

    // 尝试不同的响应格式
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content
    } else if (data.content && data.content[0]?.text) {
      return data.content[0].text
    } else if (data.response) {
      return data.response
    } else if (data.text) {
      return data.text
    } else {
      throw new Error('无法解析 API 响应格式')
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testMessages: Message[] = [
        { role: 'user', content: 'Hello, this is a connection test.' }
      ]

      const response = await this.sendMessage(testMessages)
      return response.length > 0
    } catch (error) {
      console.error('连接测试失败:', error)
      return false
    }
  }
}

export function createAiService(config: AiConfig): AiService {
  return new AiService(config)
}