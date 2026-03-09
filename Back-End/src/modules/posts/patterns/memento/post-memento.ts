import type { Post } from '@/common/types'

export type PostSnapshot = {
  content: string
  mood?: Post['mood']
  template?: Post['template']
  songId?: string
  captionText?: string
  status?: Post['status']
  updatedAt: string
}

export class PostMemento {
  constructor(private readonly state: PostSnapshot) {}

  getState(): PostSnapshot {
    return this.state
  }
}
