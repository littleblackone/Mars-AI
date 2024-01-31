export interface ImageData {
  discord_image_url: string;
  image_url: string;
  image_urls: string[];
  permanent_url: string;
  task_progress: number;
  intermediate_image_urls: string[];
  image_id: string;
  seed: string;
  result_message_id: string;
  quota_used: number;
  credit: number;
  message: string;
  error_messages: string[];
  need_retry: boolean;
  actions: string[];
}
