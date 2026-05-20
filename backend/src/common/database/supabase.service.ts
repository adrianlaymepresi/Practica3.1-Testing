import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private clienteSupabase: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  get cliente() {
    if (!this.clienteSupabase) {
      const url = this.configService.get<string>('entorno.supabase.url');
      const secretKey = this.configService.get<string>(
        'entorno.supabase.secretKey',
      );

      if (!url || !secretKey) {
        throw new Error('La configuracion de Supabase esta incompleta');
      }

      this.clienteSupabase = createClient(url, secretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    return this.clienteSupabase;
  }
}
