// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// merges tailwind classes safely — no duplicate/conflicting classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}