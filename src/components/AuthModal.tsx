'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthForm from "@/components/AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-md bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
        <AuthForm isModal isOpen={isOpen} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
