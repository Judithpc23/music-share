import { MoodType, PostTemplate, IPostPrototype } from '@/common/types'

/**
 * Abstract base class for post prototypes
 * Implements the Prototype design pattern for cloning and customizing templates
 */
export abstract class PostPrototype implements IPostPrototype {
  protected template: PostTemplate
  protected moodType: MoodType

  constructor(template: PostTemplate, moodType: MoodType) {
    this.template = template
    this.moodType = moodType
  }

  /**
   * Creates a deep clone of the prototype
   * Ensures that modifications to the clone don't affect the original
   */
  clone(): PostPrototype {
    const clonedTemplate: PostTemplate = {
      title: this.template.title,
      descriptionPlaceholder: this.template.descriptionPlaceholder,
      emotionalContext: this.template.emotionalContext,
      suggestedTags: [...this.template.suggestedTags],
      defaultPrivacy: this.template.defaultPrivacy,
      color: this.template.color,
    }

    const cloned = Object.create(Object.getPrototypeOf(this)) as PostPrototype
    cloned.template = clonedTemplate
    cloned.moodType = this.moodType

    return cloned
  }

  /**
   * Get the mood type of this prototype
   */
  getMoodType(): MoodType {
    return this.moodType
  }

  /**
   * Get the template of this prototype
   */
  getTemplate(): PostTemplate {
    return this.template
  }

  /**
   * Create a customized version of this prototype
   * Applies overrides to a clone, leaving the original unchanged
   */
  customize(overrides: Partial<PostTemplate>): PostPrototype {
    const cloned = this.clone()
    cloned.template = { ...cloned.template, ...overrides }
    return cloned
  }
}
