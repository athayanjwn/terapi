import SelfAssessmentDetailClient from "./SelfAssessmentDetailClient";

export default async function SelfAssessmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SelfAssessmentDetailClient slug={slug} />;
}
