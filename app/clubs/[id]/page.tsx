import { ClubDetailPage } from "@/components/club-detail-page"

export default function ClubPage({ params }: { params: { id: string } }) {
  return <ClubDetailPage clubId={params.id} />
}
