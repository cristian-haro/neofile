import { IConversionEngine } from '../../domain/ports/IConversionEngine';

export class EngineRouterService {
  private engines: IConversionEngine[] = [];

  constructor(engines: IConversionEngine[] = []) {
    this.engines = engines;
  }

  registerEngine(engine: IConversionEngine): void {
    // Avoid duplicate engine IDs
    this.engines = this.engines.filter(e => e.id !== engine.id);
    this.engines.push(engine);
  }

  getEngine(sourceExt: string, targetExt: string): IConversionEngine {
    const sExt = sourceExt.toLowerCase().replace(/^\./, '');
    const tExt = targetExt.toLowerCase().replace(/^\./, '');

    const matchingEngine = this.engines.find(engine => engine.canHandle(sExt, tExt));
    if (!matchingEngine) {
      throw new Error(`No compatible zero-server conversion engine registered for ${sExt.toUpperCase()} -> ${tExt.toUpperCase()}`);
    }

    return matchingEngine;
  }

  getAllEngines(): readonly IConversionEngine[] {
    return this.engines;
  }
}
