import { PostMemento } from './post-memento'

export class PostCaretaker {
  private readonly history: PostMemento[] = []

  push(memento: PostMemento) {
    this.history.push(memento)
  }

  pop(): PostMemento | undefined {
    return this.history.pop()
  }
}
