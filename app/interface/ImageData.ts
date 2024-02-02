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

export interface ImageFormData {
  aspectRatio:
    | " --ar 1:1"
    | " --ar 3:2"
    | " --ar 4:3"
    | " --ar 16:9"
    | " --ar 9:16";
  model:
    | " --v 1"
    | " --v 2"
    | " --v 3"
    | " --v 4"
    | " --v 5"
    | " --v 5.1"
    | " --v 5.2"
    | " --v 6"
    | " --niji 4"
    | " --niji 5"
    | " --niji 6";
  artStyles: string;
  negativePrompt: string;
  seeds: number;
  speed: " --fast" | " --turbo";
  stylize: number;
  chaos: number;
  prompt: string;
  numberOfImage: "1" | "2" | "3" | "4";
}

export interface StyleStatus {
  value: string;
  label: string;
}
