"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LeadsCardTableView } from "@/components/leads/LeadsCardTableView"
import "./leads-secret-table.css"

/** Карточный стол лидов V2: открывается как диалог из вкладки «Аналитика». Тот же UI, что и на странице «Покерный стол». */
export function LeadsCardTableV2Dialog({
  open,
  onOpenChange,
  selectedManagerId,
  onSelectedManagerIdChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedManagerId: string
  onSelectedManagerIdChange: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="v2-table-dialog !fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !m-0 !h-screen !w-screen !max-w-none !rounded-none !border-0 !p-0 overflow-hidden flex flex-col"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Карточный стол лидов v2</DialogTitle>
          <DialogDescription>Расклад лидов по этапам</DialogDescription>
        </DialogHeader>
        <LeadsCardTableView
          variant="dialog"
          selectedManagerId={selectedManagerId}
          onSelectedManagerIdChange={onSelectedManagerIdChange}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
