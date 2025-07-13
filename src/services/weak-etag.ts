export type WeakETagValueType = string;

export class WeakETag {
  static fromRevision(revision: number) {
    return { "if-match": `W/${revision}` };
  }
}
