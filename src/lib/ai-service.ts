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

interface DocumentChunk {
  id: string
  content: string
  index: number
  totalChunks: number
  summary?: string
}

interface AgentTask {
  id: string
  type: 'summarize' | 'analyze' | 'extract'
  chunk: DocumentChunk
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: string
  error?: string
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

  // 文档分段处理
  splitDocument(content: string, maxChunkSize: number = 3000): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const paragraphs = content.split(/\n\s*\n/)

    let currentChunk = ''
    let chunkIndex = 0

    for (const paragraph of paragraphs) {
      // 如果当前段落太长，需要进一步分割
      if (paragraph.length > maxChunkSize) {
        // 先保存当前chunk
        if (currentChunk.trim()) {
          chunks.push({
            id: `chunk-${chunkIndex}`,
            content: currentChunk.trim(),
            index: chunkIndex,
            totalChunks: 0 // 稍后更新
          })
          chunkIndex++
          currentChunk = ''
        }

        // 按句子分割长段落
        const sentences = paragraph.split(/[.!?。！？]\s+/)
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.trim()) {
              chunks.push({
                id: `chunk-${chunkIndex}`,
                content: currentChunk.trim(),
                index: chunkIndex,
                totalChunks: 0
              })
              chunkIndex++
            }
            currentChunk = sentence
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence
          }
        }
      } else {
        // 检查添加这个段落是否会超出限制
        if (currentChunk.length + paragraph.length > maxChunkSize) {
          // 保存当前chunk
          if (currentChunk.trim()) {
            chunks.push({
              id: `chunk-${chunkIndex}`,
              content: currentChunk.trim(),
              index: chunkIndex,
              totalChunks: 0
            })
            chunkIndex++
          }
          currentChunk = paragraph
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph
        }
      }
    }

    // 保存最后一个chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        index: chunkIndex,
        totalChunks: 0
      })
    }

    // 更新总数
    const totalChunks = chunks.length
    chunks.forEach(chunk => {
      chunk.totalChunks = totalChunks
    })

    return chunks
  }

  // 并行处理多个chunks
  async processDocumentChunks(
    chunks: DocumentChunk[],
    taskType: 'summarize' | 'analyze' | 'extract' = 'summarize',
    onProgress?: (progress: { completed: number; total: number; currentTask?: AgentTask }) => void
  ): Promise<AgentTask[]> {
    const tasks: AgentTask[] = chunks.map(chunk => ({
      id: `task-${chunk.id}`,
      type: taskType,
      chunk,
      status: 'pending'
    }))

    // 限制并发数量以避免API限制
    const concurrency = 3
    const results: AgentTask[] = []

    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency)

      const batchPromises = batch.map(async (task) => {
        task.status = 'processing'
        onProgress?.({ completed: results.length, total: tasks.length, currentTask: task })

        try {
          const prompt = this.getPromptForTaskType(task.type, task.chunk)
          const messages: Message[] = [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user }
          ]

          const result = await this.sendMessage(messages)

          task.status = 'completed'
          task.result = result
          task.chunk.summary = taskType === 'summarize' ? result : task.chunk.summary

          return task
        } catch (error) {
          task.status = 'failed'
          task.error = error instanceof Error ? error.message : '未知错误'
          return task
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      onProgress?.({ completed: results.length, total: tasks.length })

      // 避免API频率限制
      if (i + concurrency < tasks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // 合并多个agent的结果
  async synthesizeResults(tasks: AgentTask[], originalQuestion?: string): Promise<string> {
    const successfulTasks = tasks.filter(task => task.status === 'completed' && task.result)

    if (successfulTasks.length === 0) {
      return '抱歉，无法处理文档内容。'
    }

    const summaries = successfulTasks.map((task, index) =>
      `## 第${task.chunk.index + 1}部分 (共${task.chunk.totalChunks}部分)\n${task.result}`
    ).join('\n\n')

    // 如果只有一个部分，直接返回
    if (successfulTasks.length === 1) {
      return successfulTasks[0].result || ''
    }

    // 对多个部分进行综合分析
    const synthesisPrompt = originalQuestion
      ? `基于以下各部分的分析结果，综合回答用户问题："${originalQuestion}"\n\n${summaries}`
      : `请综合以下各部分的分析结果，提供一个完整的文档总结：\n\n${summaries}`

    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: '你是一个专业的文档分析师。请基于提供的各部分分析结果，生成一个连贯、完整的综合分析。保持逻辑清晰，突出重点。'
        },
        { role: 'user', content: synthesisPrompt }
      ]

      return await this.sendMessage(messages)
    } catch (error) {
      // 如果综合分析失败，返回分段结果
      return `# 文档分析结果\n\n${summaries}\n\n---\n*注：由于文档较长，已分段处理。如需特定部分的详细分析，请告诉我。*`
    }
  }

  private getPromptForTaskType(taskType: string, chunk: DocumentChunk): { system: string; user: string } {
    const chunkInfo = `这是文档的第${chunk.index + 1}部分，共${chunk.totalChunks}部分。`

    switch (taskType) {
      case 'summarize':
        return {
          system: '你是一个专业的文档分析师。请为文档片段提供准确、简洁的总结，突出关键信息和要点。',
          user: `${chunkInfo}\n\n请总结以下内容的要点：\n\n${chunk.content}`
        }
      case 'analyze':
        return {
          system: '你是一个专业的文档分析师。请深入分析文档片段的内容、结构和关键概念。',
          user: `${chunkInfo}\n\n请详细分析以下内容：\n\n${chunk.content}`
        }
      case 'extract':
        return {
          system: '你是一个专业的信息提取专家。请从文档片段中提取关键信息、概念和数据。',
          user: `${chunkInfo}\n\n请从以下内容中提取关键信息：\n\n${chunk.content}`
        }
      default:
        return {
          system: '你是一个专业的文档助手。请帮助用户理解文档内容。',
          user: `${chunkInfo}\n\n内容：\n\n${chunk.content}`
        }
    }
  }
}

export function createAiService(config: AiConfig): AiService {
  return new AiService(config)
}