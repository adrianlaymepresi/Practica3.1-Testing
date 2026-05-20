import { Injectable } from '@nestjs/common';
import { ApiException } from '../exceptions/api.exception';
import { SupabaseService } from './supabase.service';

@Injectable()
export class ReferenciasRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async contarPorCampo(
    nombreTabla: string,
    campo: string,
    valor: string | number | boolean,
  ) {
    const { count, error } = await this.supabaseService.cliente
      .from(nombreTabla)
      .select('*', { count: 'exact', head: true })
      .eq(campo, valor);

    if (error) {
      throw ApiException.desdeSupabase(error);
    }

    return count ?? 0;
  }
}
