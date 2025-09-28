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

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface AnthropicResponse {
  content: Array<{
    text: string
  }>
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

    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(messages)
      case 'anthropic':
        return this.callAnthropic(messages)
      case 'custom':
        return this.callCustomAPI(messages)
      default:
        throw new Error(`不支持的 AI 服务商: ${this.config.provider}`)
    }
  }

  private async callOpenAI(messages: Message[]): Promise<string> {
    const apiUrl = this.config.apiUrl || 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API 错误: ${response.status} - ${errorData}`)
    }

    const data: OpenAIResponse = await response.json()
    return data.choices[0]?.message?.content || '抱歉，我没有收到回复。'
  }

  private async callAnthropic(messages: Message[]): Promise<string> {
    const apiUrl = this.config.apiUrl || 'https://api.anthropic.com/v1/messages'

    // Anthropic API 格式转换
    const systemMessage = messages.find(m => m.role === 'system')
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: systemMessage?.content || '',
        messages: conversationMessages
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Anthropic API 错误: ${response.status} - ${errorData}`)
    }

    const data: AnthropicResponse = await response.json()
    return data.content[0]?.text || '抱歉，我没有收到回复。'
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