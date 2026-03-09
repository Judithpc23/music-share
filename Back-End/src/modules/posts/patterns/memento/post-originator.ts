import type { Post } from '@/common/types'
import { PostMemento, type PostSnapshot } from './post-memento'

export class PostOriginator {
  private state: PostSnapshot

  constructor(post: Post) {
    this.state = {
      content: post.content,
      mood: post.mood,
      template: post.template,
      songId: post.songId,
      captionText: post.captionText,
      status: post.status,
      updatedAt: post.updatedAt?.toISOString() ?? new Date().toISOString(),
    }
  }

  save(): PostMemento {
    return new PostMemento({ ...this.state })
  }

  restore(memento: PostMemento): PostSnapshot {
    this.state = memento.getState()
    return this.state
  }
}
