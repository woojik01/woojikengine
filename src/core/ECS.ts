// Entity-Component-System Framework
import type { EntityID, ComponentType, SystemType } from './types';

export interface IComponent { type: ComponentType; }
export interface ISystem { type: SystemType; update(deltaTime: number, entities: Map<EntityID, Entity>): void; }

export class Entity {
  private static nextId: EntityID = 0;
  readonly id: EntityID;
  private components: Map<ComponentType, IComponent> = new Map();
  private active: boolean = true;
  private tags: Set<string> = new Set();

  constructor() { this.id = Entity.nextId++; }

  addComponent<T extends IComponent>(component: T): T { this.components.set(component.type, component); return component; }
  getComponent<T extends IComponent>(type: ComponentType): T | undefined { return this.components.get(type) as T | undefined; }
  removeComponent(type: ComponentType): boolean { return this.components.delete(type); }
  hasComponent(type: ComponentType): boolean { return this.components.has(type); }
  getComponents(): Map<ComponentType, IComponent> { return new Map(this.components); }
  addTag(tag: string): void { this.tags.add(tag); }
  removeTag(tag: string): boolean { return this.tags.delete(tag); }
  hasTag(tag: string): boolean { return this.tags.has(tag); }
  getTags(): Set<string> { return new Set(this.tags); }
  setActive(active: boolean): void { this.active = active; }
  isActive(): boolean { return this.active; }
  destroy(): void { this.components.clear(); this.tags.clear(); this.active = false; }
  clone(): Entity {
    const newEntity = new Entity();
    for (const [type, component] of this.components) newEntity.components.set(type, { ...component });
    for (const tag of this.tags) newEntity.tags.add(tag);
    newEntity.active = this.active;
    return newEntity;
  }
}

export class ECSWorld {
  private entities: Map<EntityID, Entity> = new Map();
  private systems: Map<SystemType, ISystem> = new Map();
  private entityQueue: Entity[] = [];
  private entityRemoveQueue: EntityID[] = [];

  addEntity(entity: Entity): void { this.entityQueue.push(entity); }
  addEntityImmediate(entity: Entity): void { this.entities.set(entity.id, entity); }
  removeEntity(id: EntityID): boolean { this.entityRemoveQueue.push(id); return true; }
  removeEntityImmediate(id: EntityID): boolean {
    const entity = this.entities.get(id);
    if (entity) { entity.destroy(); return this.entities.delete(id); }
    return false;
  }
  addSystem(system: ISystem): void { this.systems.set(system.type, system); }
  removeSystem(type: SystemType): boolean { return this.systems.delete(type); }
  getSystem<T extends ISystem>(type: SystemType): T | undefined { return this.systems.get(type) as T | undefined; }
  getEntity(id: EntityID): Entity | undefined { return this.entities.get(id); }
  getAllEntities(): Map<EntityID, Entity> { return new Map(this.entities); }

  update(deltaTime: number): void {
    for (const id of this.entityRemoveQueue) this.entities.delete(id);
    this.entityRemoveQueue = [];
    while (this.entityQueue.length > 0) {
      const entity = this.entityQueue.pop()!;
      this.entities.set(entity.id, entity);
    }
    for (const system of this.systems.values()) system.update(deltaTime, this.entities);
  }

  filterEntities(...componentTypes: ComponentType[]): Entity[] {
    const result: Entity[] = [];
    for (const entity of this.entities.values()) {
      if (entity.isActive() && componentTypes.every(type => entity.hasComponent(type))) result.push(entity);
    }
    return result;
  }

  filterEntitiesByTag(tag: string): Entity[] {
    const result: Entity[] = [];
    for (const entity of this.entities.values()) {
      if (entity.isActive() && entity.hasTag(tag)) result.push(entity);
    }
    return result;
  }

  clear(): void {
    for (const entity of this.entities.values()) entity.destroy();
    this.entities.clear();
    this.entityQueue = [];
    this.entityRemoveQueue = [];
  }
  getEntityCount(): number { return this.entities.size + this.entityQueue.length; }
  getSystemCount(): number { return this.systems.size; }
}