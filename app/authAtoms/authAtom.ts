import { atom } from 'jotai'
import { UserAuth } from '../types/authTypes'

export const authenticatedAtom = atom<UserAuth | null>(null)