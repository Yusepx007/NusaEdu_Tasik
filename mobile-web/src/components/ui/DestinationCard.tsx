'use client';
import type { Destination } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { resolveImage } from '@/lib/images';
import styles from './DestinationCard.module.css';

interface Props {
  destination: Destination;
  compact?: boolean;
}

export default function DestinationCard({ destination, compact = false }: Props) {
  const router = useRouter();
  const imgSrc = resolveImage(destination.image_url, destination.wisata_key, destination.name);

  return (
    <div
      className={`${styles.card} ${compact ? styles.compact : ''}`}
      onClick={() => router.push(`/destinations/${destination.id}`)}
    >
      <div className={styles.imgWrapper}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={destination.name}
            className={styles.img}
            loading="lazy"
            onError={(e) => {
              // Jika URL dari API gagal, coba local fallback
              const local = resolveImage(undefined, destination.wisata_key, destination.name);
              if (local && (e.target as HTMLImageElement).src !== window.location.origin + local) {
                (e.target as HTMLImageElement).src = local;
              } else {
                (e.target as HTMLImageElement).style.display = 'none';
              }
            }}
          />
        ) : (
          <div className={styles.imgPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className={styles.overlay} />
        {destination.category && <div className={styles.categoryBadge}>{destination.category}</div>}
        <div className={styles.ratingBadge}>
          <span>⭐</span> {destination.rating || '4.8'}
        </div>
      </div>
      <div className={styles.info}>
        <h4 className={styles.name}>{destination.name}</h4>
        {destination.location && (
          <p className={styles.location}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {destination.location}
          </p>
        )}
      </div>
    </div>
  );
}

