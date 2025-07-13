export type ETagValueType = string;

export class ETag {
  static fromRevision(revision: number) {
    return { "if-match": String(revision) };
  }
}
