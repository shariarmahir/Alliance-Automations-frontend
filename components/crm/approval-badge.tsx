"use client"

import { APPROVAL } from "@/components/crm/order-meta"
import type { ShadeApproval } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

export function ApprovalBadge({ approval }: { approval: ShadeApproval }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap", APPROVAL[approval].className)}>{APPROVAL[approval].label}</span>
}
