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
