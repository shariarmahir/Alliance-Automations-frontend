import { ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RISKS } from "@/lib/roadmap"

export function RiskList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Main risks</CardTitle>
        <CardDescription>And what the plan does about each</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {RISKS.map((item) => (
          <div key={item.risk} className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 text-sm">
            <ShieldAlert className="size-4 text-held" aria-hidden />
            <p className="font-medium">{item.risk}</p>
            <p className="text-xs text-muted-foreground">{item.mitigation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
