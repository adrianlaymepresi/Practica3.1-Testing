import { IsString, IsUUID } from 'class-validator';

export class CrearUsuarioDto {
  @IsUUID()
  id_empleado: string;

  @IsUUID()
  id_rol: string;
}
