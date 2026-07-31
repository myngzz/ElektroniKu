import {
  Smartphone, Laptop, Headphones, Camera, Tv, Package,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphone: Headphones,
  kamera: Camera,
  'smart-tv': Tv,
};

export default function CategoryIcon({ slug, className = 'w-5 h-5' }: { slug?: string; className?: string }) {
  const Icon = (slug && ICONS[slug]) || Package;
  return <Icon className={className} strokeWidth={1.5} />;
}
