import { notFound } from 'next/navigation';
import { guides } from '@/lib/mobile-guides.mjs';
import { handouts } from '@/lib/handouts.mjs';
import GuideReader from '@/components/guide-reader';
export function generateStaticParams() {
  return Object.keys(guides).map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = (guides as any)[id];
  return {
    title: guide ? `${guide.title} | Bloom` : 'Guide not found | Bloom',
  };
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    guide = (guides as any)[id],
    doc = handouts.find((d) => d.id === id);
  if (!guide || !doc) notFound();
  return <GuideReader guide={guide} pdf={doc!.url} />;
}
