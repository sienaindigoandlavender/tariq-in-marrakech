import { sceneSvg } from "@/lib/scenes";

/** Painted SVG scene. `uid` keeps gradient ids unique when several posters share a page. */
export function PosterScene({ scene, uid, className }: { scene: string; uid?: string; className?: string }) {
  return <div className={className ?? "absolute inset-0"} dangerouslySetInnerHTML={{ __html: sceneSvg(scene, uid ?? scene) }} />;
}
