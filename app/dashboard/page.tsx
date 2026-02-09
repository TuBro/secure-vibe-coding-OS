import { ChartAreaInteractive } from "./chart-area-interactive"
import { DataTable } from "./data-table"
import { SectionCards } from "./section-cards"
import { SiteNotesFeed } from "./site-notes-feed"
import { SiteOperations } from "./site-operations"
import data from "./data.json"

export default function Page() {
  return (
    <>
      <SectionCards />

      {/* New Site Notes Feed */}
      <SiteNotesFeed />

      {/* Site Operations with Kanban Board */}
      <SiteOperations />

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      <DataTable data={data} />
    </>
  )
}