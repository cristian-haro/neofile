import { ConversionMatrix, ConversionTarget } from '../../domain/entities/ConversionMatrix';

export class GetCompatibleTargetsUseCase {
  execute(sourceExt: string): ConversionTarget[] {
    return ConversionMatrix.getCompatibleTargets(sourceExt);
  }
}
