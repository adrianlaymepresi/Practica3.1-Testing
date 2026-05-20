import { Global, Module } from '@nestjs/common';
import { ReferenciasRepository } from './referencias.repository';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [SupabaseService, ReferenciasRepository],
  exports: [SupabaseService, ReferenciasRepository],
})
export class SupabaseModule {}
