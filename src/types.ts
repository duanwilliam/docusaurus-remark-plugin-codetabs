import { Node } from "unist";
import type { Language } from "./languages";

export interface Options {
  sync?: 'all' | boolean;
  customLabels?: Record<Language, string>
}

// unist

export interface MDASTNode extends Node {
  lang?: string;
  meta?: string;
  value: string;
  children?: MDASTNode[];
}