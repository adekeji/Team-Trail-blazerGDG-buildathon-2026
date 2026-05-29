/**
 * Mock QueueWatch SDK
 * In a real-world scenario, this would be an npm package installed by the client.
 */
export class QueueWatchSDK {
  private endpoint: string;

  constructor(endpoint: string = 'http://localhost:3000/api/events/track') {
    this.endpoint = endpoint;
  }

  async trackEvent(queueName: string, status: 'completed' | 'failed' | 'retried', metadata?: Record<string, any>) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queue_name: queueName,
          status,
          metadata,
        }),
      });
    } catch (error) {
      console.error('QueueWatch SDK Error:', error);
    }
  }

  async trackJobSuccess(queueName: string, metadata?: Record<string, any>) {
    return this.trackEvent(queueName, 'completed', metadata);
  }

  async trackJobFailure(queueName: string, errorMsg: string, metadata?: Record<string, any>) {
    return this.trackEvent(queueName, 'failed', { ...metadata, error: errorMsg });
  }
}

export const qw = new QueueWatchSDK();

/**
 * Auto-Intercept Wrapper
 * Wraps any background job to automatically track successes and failures without manual try/catch blocks.
 */
export async function withQueueWatch<T>(queueName: string, jobFunction: () => Promise<T>): Promise<T> {
  try {
    const result = await jobFunction();
    await qw.trackJobSuccess(queueName);
    return result;
  } catch (error: any) {
    await qw.trackJobFailure(queueName, error.message || 'Unknown error');
    throw error;
  }
}

