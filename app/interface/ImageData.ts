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
  aspectRatio?:
    | " --ar 1:1"
    | " --ar 3:2"
    | " --ar 4:3"
    | " --ar 16:9"
    | " --ar 9:16";
  model?:
    | " --v 4"
    | " --v 5"
    | " --v 5.1"
    | " --v 5.2"
    | " --v 6"
    | " --niji 4"
    | " --niji 5"
    | " --niji 6";
  artStyles?: string;
  negativePrompt?: string;
  seeds?: number;
  stylize: number;
  chaos: number;
  prompt: string;
}

export interface StyleStatus {
  value: string;
  label: string;
}

export interface FullViewData {
  index: number;
  parentTaskId: string;
  parentSeed: string;
  finalPrompt: string;
  tempFormValue: ImageFormData | undefined;
  open: boolean;
  ParentimageArr: string[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
