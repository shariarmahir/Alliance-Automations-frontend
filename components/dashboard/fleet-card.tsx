"use client"

import Link from "next/link"
import { FleetMap } from "@/components/plant/fleet-map"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlant } from "@/lib/store/plant"

export function FleetCard() {
  const views = usePlant((state) => state.views)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet map</CardTitle>
        <CardDescription>Every machine by bay. The bar under each cell is cycle progress.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/control">Control panel</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FleetMap views={views} />
      </CardContent>
    </Card>
  )
}
