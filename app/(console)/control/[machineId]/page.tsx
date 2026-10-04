import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MachineDetail } from "@/components/control/machine-detail"
import { MACHINES, machineById } from "@/lib/domain/catalog"

export function generateStaticParams() {
  return MACHINES.map((machine) => ({ machineId: machine.id }))
}

export async function generateMetadata({ params }: PageProps<"/control/[machineId]">): Promise<Metadata> {
  const machine = machineById.get((await params).machineId)
  return { title: machine ? `${machine.id} ${machine.name}` : "Machine" }
}

export default async function MachinePage({ params }: PageProps<"/control/[machineId]">) {
  const { machineId } = await params
  if (!machineById.has(machineId)) notFound()
  return <MachineDetail machineId={machineId} />
}
