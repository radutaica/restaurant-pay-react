declare module '@rails/actioncable' {
  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Channel {
    channel: string;
    [key: string]: any;
  }

  export interface SubscriptionCallbacks {
    connected?(): void;
    disconnected?(): void;
    received?(data: any): void;
    rejected?(): void;
  }

  export interface Consumer {
    subscriptions: {
      create(
        channel: Channel | string,
        callbacks?: SubscriptionCallbacks
      ): Subscription;
    };
    disconnect(): void;
  }

  export function createConsumer(url?: string): Consumer;
}

