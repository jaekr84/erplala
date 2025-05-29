import { toast as sonnerToast } from 'sonner'

type ToastInput = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: ToastInput) {
  if (variant === 'destructive') {
    sonnerToast.error(title, { description })
  } else {
    sonnerToast.success(title, { description })
  }
}