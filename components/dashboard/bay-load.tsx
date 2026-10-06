"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { bayLoad } from "@/lib/domain/analytics"
import { formatKg } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"

export function BayLoad() {
  const views = usePlant((state) => state.views)
  const bays = bayLoad(views)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Bay load</CardTitle>
        <CardDescription>Machines processing and kilograms in the bath</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {bays.map((bay) => (
          <div key={bay.bay} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">
                {bay.label} <span className="text-xs font-normal text-muted-foreground">D{bay.range}</span>
              </span>
              <span className="text-xs text-muted-foreground tabular">
                {bay.processing}/{bay.available} · {formatKg(bay.kgInProcess)}
                {bay.alerts > 0 && <span className="ml-2 text-delayed">{bay.alerts} alert{bay.alerts > 1 && "s"}</span>}
              </span>
            </div>
            <Progress value={(bay.kgInProcess / bay.capacityKg) * 100} aria-label={`${bay.label} load`} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
