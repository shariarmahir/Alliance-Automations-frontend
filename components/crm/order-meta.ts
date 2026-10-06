import type { OrderStage, ShadeApproval } from "@/lib/domain/types"

export const STAGES: { stage: OrderStage; label: string }[] = [
  { stage: "lab-dip", label: "Lab dip" },
  { stage: "planned", label: "Planned" },
  { stage: "dyeing", label: "Dyeing" },
  { stage: "finishing", label: "Finishing" },
  { stage: "packed", label: "Packed" },
  { stage: "shipped", label: "Shipped" },
]

export const APPROVAL: Record<ShadeApproval, { label: string; className: string }> = {
  approved: { label: "Shade approved", className: "bg-running/12 text-running" },
  pending: { label: "Approval pending", className: "bg-held/12 text-held" },
  correction: { label: "Correction asked", className: "bg-delayed/12 text-delayed" },
}
