export type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ExpectationType = "culture" | "curiosity" | "family";
export type JourneyStamp = "灯" | "墨" | "年" | "山";
export type InteractionId = "lantern" | "ink" | "year" | "macaque";
export interface RouteDay {
  day: number;
  title: string;
  subtitle: string;
  places: string[];
}
export interface LeadPayload {
  phone: string;
  age: string;
  name?: string;
}
export type LeadState = "idle" | "submitting" | "success" | "error";
