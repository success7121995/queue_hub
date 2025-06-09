import { Session, SessionData, Store } from 'express-session';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

class PrismaSessionStore extends Store {
  private emitter = new EventEmitter();

  constructor() {
    super();
    this.emitter.setMaxListeners(0);
  }

  // Event emitter methods
  addListener(event: string, listener: (...args: any[]) => void): this {
    this.emitter.addListener(event, listener);
    return this;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  once(event: string, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    this.emitter.removeListener(event, listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  removeAllListeners(event?: string): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  listeners(event: string): Function[] {
    return this.emitter.listeners(event);
  }

  rawListeners(event: string): Function[] {
    return this.emitter.rawListeners(event);
  }

  emit(event: string, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  prependListener(event: string, listener: (...args: any[]) => void): this {
    this.emitter.prependListener(event, listener);
    return this;
  }

  prependOnceListener(event: string, listener: (...args: any[]) => void): this {
    this.emitter.prependOnceListener(event, listener);
    return this;
  }

  eventNames(): Array<string | symbol> {
    return this.emitter.eventNames();
  }

  // Session store methods
  private async getSession(sid: string): Promise<Session | undefined> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sid }
      });

      if (!session) return undefined;

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.destroy(sid);
        return undefined;
      }

      return JSON.parse(session.data);
    } catch (error) {
      console.error('Error getting session:', error);
      return undefined;
    }
  }

  async get(sid: string, callback: (err: any, session?: SessionData | undefined) => void): Promise<void> {
    try {
      const session = await this.getSession(sid);
      callback(null, session);
    } catch (error) {
      callback(error);
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expiresAt = session.cookie?.expires 
        ? new Date(session.cookie.expires)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

      await prisma.session.upsert({
        where: { id: sid },
        update: {
          data: JSON.stringify(session),
          expiresAt,
          updatedAt: new Date()
        },
        create: {
          id: sid,
          data: JSON.stringify(session),
          expiresAt,
        }
      });

      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await prisma.session.delete({
        where: { id: sid }
      });
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async clear(callback?: (err?: any) => void): Promise<void> {
    try {
      await prisma.session.deleteMany({});
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async length(callback: (err: any, length: number) => void): Promise<void> {
    try {
      const count = await prisma.session.count();
      callback(null, count);
    } catch (error) {
      callback(error, 0);
    }
  }

  async touch(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expiresAt = session.cookie?.expires 
        ? new Date(session.cookie.expires)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

      await prisma.session.update({
        where: { id: sid },
        data: {
          expiresAt,
          updatedAt: new Date()
        }
      });

      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  // Additional required methods
  regenerate(req: any, callback: (err?: any) => void): void {
    const sid = req.sessionID;
    this.destroy(sid, (err) => {
      if (err) {
        callback(err);
        return;
      }
      req.session.regenerate(callback);
    });
  }

  load(sid: string, callback: (err: any, session?: SessionData | undefined) => void): void {
    this.get(sid, callback);
  }

  createSession(req: any, session: SessionData): Session & SessionData {
    // Create a new session object with all required methods
    const newSession = {
      ...session,
      id: req.sessionID,
      regenerate: (callback: (err?: any) => void) => {
        this.regenerate(req, callback);
      },
      destroy: (callback: (err?: any) => void) => {
        this.destroy(req.sessionID, callback);
      },
      reload: (callback: (err?: any) => void) => {
        this.load(req.sessionID, callback);
      },
      save: (callback?: (err?: any) => void) => {
        this.set(req.sessionID, newSession, callback);
      },
      touch: () => {
        this.touch(req.sessionID, newSession);
      },
      resetMaxAge: () => {
        if (newSession.cookie && typeof newSession.cookie.originalMaxAge === 'number') {
          newSession.cookie.maxAge = newSession.cookie.originalMaxAge;
        }
        this.touch(req.sessionID, newSession);
      }
    } as Session & SessionData;

    // Assign the new session to req.session
    req.session = newSession;
    return newSession;
  }
}

export default PrismaSessionStore; 