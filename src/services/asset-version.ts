export class AssetVersion {
  static url(path: string, version: string): string {
    return version ? `${path}?v=${version}` : path;
  }
}
