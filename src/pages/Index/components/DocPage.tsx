// components/ExploreDocsDetailPageWrapper.tsx

import { useParams } from "react-router-dom"
import { getDocById } from "./data"
import DocDetail from "./ExploreDocsDetailPage"

export default function ExploreDocsDetailPageWrapper() {
  const { id } = useParams<{ id: string }>()
  const doc = getDocById(id || "")

  if (!doc) {
    return <div className="text-white text-center mt-20">Documentation not found.</div>
  }

  // 🔽 Slugify name and generate PDF path
  const slugifiedName = doc.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
  const pdfPath = `/docs/CodeNexAI-${slugifiedName}-Documentation.html`

  return <DocDetail doc={{ ...doc, pdfUrl: pdfPath }} />
}
