export interface TaskResult {
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
  warning: string;
  error_messages: string[];
  need_retry: boolean;
  actions: string[];
}

export interface TaskParam {
  prompt: string;
  index: string;
  zoom_ratio: string;
  aspect_ratio: string;
  direction: string;
}

export interface TaskMeta {
  account_id: string;
  task_type: string;
  origin_task_id: string;
  bot_hash: string;
  bot_id: number;
  model_version: string;
  process_mode: string;
  quota_frozen: number;
  frozen_credit: number;
  created_at: number;
  created_at_utc: string;
  started_at: number;
  started_at_utc: string;
  ended_at: number;
  ended_at_utc: string;
  task_request: {
    task_id: string;
  };
  task_param: TaskParam;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  process_time: number;
  retry_count: number;
  meta: TaskMeta;
  task_result: TaskResult;
}

export interface FetchImageData {
  data: TaskResponse;
}

export interface ImageFormData {
  aspectRatio?:
    | " --ar 1:1"
    | " --ar 3:2"
    | " --ar 4:3"
    | " --ar 16:9"
    | " --ar 9:16"
    | " ";
  model?: " --v 5.2" | " --v 6" | " --niji 6";
  quality: " --q .25" | " --q .5" | " --q 1";
  negativePrompt?: string;
  seeds?: number;
  stylize: number;
  chaos: number;
  prompt: string;
  imageWeight: number;
  stop: number;

  weird: number;
}

export interface StyleStatus {
  value: string;
  label: string;
}

export interface FullViewData {
  selectedIndex: number;
  useStyleRaw: boolean;
  customAS: boolean;
  customASW: number;
  customASH: number;
  useTile: boolean;
  parentTaskId: string;
  parentSeed: string;
  finalPrompt: string;
  tempFormValue: ImageFormData | undefined;
  open: boolean;
  parentimageArr: string[];
  setOriginTaskId: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setParentImgArr: React.Dispatch<React.SetStateAction<string[]>>;
  setParentSeed: React.Dispatch<React.SetStateAction<string>>;
}

export interface InpaintData {
  open: boolean;
  originTaskId: string;
  parentPrompt: string;
  setParentSeed: React.Dispatch<React.SetStateAction<string>>;
  setOriginTaskId: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIndex: number;
  parentimageArr: string[];
  setParentImageArr: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface Options {
  AspectRatio: string;
  Chaos: string;
  ImageWeight: string;
  Quality: string;
  Stop: string;
  Style: string;
  Stylize: string;
  Tile: boolean;
  Weird: string;
  Seed: string;
  Version: string;
}
