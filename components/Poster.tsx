/* eslint-disable @next/next/no-img-element */
import { PosterScene } from "./PosterScene";

type Props = {
  scene: string;
  image_url?: string | null;
  alt?: string;
  uid?: string;
  tag?: string;
  badge?: string | null;
  dist?: string;
  className?: string;
  hover?: boolean;
};

/** Product poster: a real photo when image_url is set, otherwise the painted scene. */
export function Poster({ scene, image_url, alt = "", uid, tag, badge, dist, className = "", hover }: Props) {
  return (
    <div
      className={`relative aspect-[4/3] max-w-full overflow-hidden rounded-card bg-soft ${
        hover ? "transition-transform duration-300 group-hover:-translate-y-[3px] motion-reduce:transform-none" : ""
      } ${className}`}
    >
      {image_url ? (
        <img src={image_url} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <PosterScene scene={scene} uid={uid} />
      )}
      {tag ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-[9px] py-1 text-[11.5px] font-extrabold text-[#16162a]">{tag}</span>
      ) : null}
      {badge ? (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-sun phone:left-2.5 phone:right-auto phone:top-[38px] px-[9px] py-1 text-[11.5px] font-extrabold text-sun-ink">{badge}</span>
      ) : null}
      {dist ? (
        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[rgb(16_12_36/.72)] px-[9px] py-1 text-[11.5px] font-bold text-white">{dist}</span>
      ) : null}
    </div>
  );
}

export function distLabel(p: { km: number; drive_time: string }): string {
  return `${p.km ? p.km + " km · " : ""}${p.drive_time}`;
}
